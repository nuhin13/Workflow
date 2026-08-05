// E00-T02/T04 · API composition root wiring.
//
// Registers the system module, the request-context middleware, the error filter,
// and the PostgreSQL bindings. No product module exists yet; adding one here
// without its own epic would be an unauthorized surface.

import {
  Global,
  Inject,
  Module,
  type MiddlewareConsumer,
  type NestModule,
  type OnApplicationShutdown,
} from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Pool } from 'pg';
import {
  PostgresSystemProbeRepository,
  RunSystemProbeUseCase,
  registerModuleBoundary,
} from '@garazo/server-core';
import { createStructuredLogger, loadRuntimeConfig } from '@garazo/runtime-config';
import { ApiErrorFilter } from './common/errors/api-error.filter';
import { RequestContextMiddleware } from './common/request/request-context.middleware';
import { anonymousContext } from '@garazo/server-core';
import { PostgresReadinessCheck } from './system/postgres-readiness.check';
import { SystemModule } from './system/system.module';
import {
  READINESS_CHECK,
  WALKING_SKELETON_PROBE,
  type ReadinessCheck,
  type WalkingSkeletonProbe,
} from './system/system.service';

export const apiModuleBoundary = registerModuleBoundary('api-root');

export const DATABASE_POOL = Symbol('DATABASE_POOL');

/**
 * The process's single PostgreSQL pool and the adapters bound to it.
 *
 * Global so the system slice receives these without importing a database module
 * — the slice depends on ports, and which datastore satisfies them is a
 * composition-root decision (ADR-0002, ADR-0004).
 *
 * One pool per process. Creating pools ad hoc leaks connections until the
 * managed database refuses new ones, a failure that shows up under load in
 * production and looks like a database fault rather than an application one.
 */
@Global()
@Module({
  providers: [
    {
      provide: DATABASE_POOL,
      useFactory: (): Pool => {
        const pool = new Pool({
          connectionString: loadRuntimeConfig('api', process.env).databaseUrl,
          // Bounded so a single API container cannot exhaust the managed
          // database's connection limit by itself.
          max: 10,
          // Fail fast instead of hanging the request: an unavailable database
          // must surface as the contract's 503, not as a client timeout.
          connectionTimeoutMillis: 5000,
          idleTimeoutMillis: 30000,
        });

        // WITHOUT THIS HANDLER THE API PROCESS DIES.
        //
        // node-postgres emits 'error' on the Pool when an IDLE client's
        // connection drops — a database restart, a failover, an idle timeout on
        // the managed side. An 'error' event with no listener is an unhandled
        // exception in Node, so the container crashes instead of returning the
        // 503 the contract promises. Verified: stopping PostgreSQL killed the
        // API outright until this was added.
        //
        // Dropped idle connections are normal and recoverable; the pool creates
        // fresh ones on the next query. Logging via the redacting logger keeps
        // the connection string out of the record.
        const logger = createStructuredLogger('api');
        pool.on('error', (error: Error) => {
          logger.warn('database pool client error', { error });
        });

        return pool;
      },
    },
    {
      provide: READINESS_CHECK,
      useFactory: (pool: Pool): ReadinessCheck => new PostgresReadinessCheck(pool),
      inject: [DATABASE_POOL],
    },
    {
      provide: WALKING_SKELETON_PROBE,
      useFactory: (pool: Pool): WalkingSkeletonProbe => {
        const useCase = new RunSystemProbeUseCase(new PostgresSystemProbeRepository(pool));
        return {
          // The transport already owns correlation; the probe port needs only
          // the resulting count, so the context is created here rather than
          // widening the port's signature for one diagnostic.
          recordVisit: async (): Promise<number> => {
            const result = await useCase.execute(anonymousContext('system-probe', Date.now()));
            return result.visitCount;
          },
        };
      },
      inject: [DATABASE_POOL],
    },
  ],
  exports: [DATABASE_POOL, READINESS_CHECK, WALKING_SKELETON_PROBE],
})
export class DatabaseModule implements OnApplicationShutdown {
  private readonly pool: Pool;

  constructor(@Inject(DATABASE_POOL) pool: Pool) {
    this.pool = pool;
  }

  async onApplicationShutdown(): Promise<void> {
    // Closing the pool is what makes graceful shutdown mean something:
    // in-flight queries finish and sockets are released rather than severed.
    await this.pool.end();
  }
}

@Module({
  imports: [DatabaseModule, SystemModule],
  providers: [
    // Registered globally so that EVERY failure leaves through one redaction
    // path, including failures on routes that do not exist.
    { provide: APP_FILTER, useClass: ApiErrorFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // '*splat' is the Nest 11 / Express 5 catch-all: every request gets a
    // context, so no response can lack a correlation id.
    consumer.apply(RequestContextMiddleware).forRoutes('*splat');
  }
}
