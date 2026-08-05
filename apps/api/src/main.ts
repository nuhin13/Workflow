// E00-T01/T03 · API composition root.
//
// Order matters: configuration is validated BEFORE Nest is constructed, so a
// misconfigured process dies immediately with a clear, value-free message
// instead of booting and failing later under traffic.

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import {
  createStructuredLogger,
  installGracefulShutdown,
  loadRuntimeConfig,
  ConfigError,
} from '@garazo/runtime-config';
import { AppModule } from './app.module';

export async function bootstrapApi(): Promise<void> {
  const config = loadRuntimeConfig('api', process.env);
  const logger = createStructuredLogger('api', undefined, config.logLevel);

  const app = await NestFactory.create(AppModule, { logger: false });

  // Nest's own hooks are enabled so module-level onModuleDestroy handlers run;
  // installGracefulShutdown bounds the whole thing and owns process exit.
  app.enableShutdownHooks();
  installGracefulShutdown(app, {
    onShutdown: (signal) => logger.info('shutting down', { signal }),
  });

  await app.listen(config.apiPort ?? 3000, '0.0.0.0');
  logger.info('api started', { port: config.apiPort, appEnv: config.appEnv });
}

if (require.main === module) {
  bootstrapApi().catch((error: unknown) => {
    // Configuration failures name keys only, so this is safe to print. Anything
    // else is reported without its message, which may carry a host or a query.
    const logger = createStructuredLogger('api');
    if (error instanceof ConfigError) {
      logger.error('invalid configuration', { keys: error.keys });
    } else {
      logger.error('api failed to start', { error });
    }
    process.exitCode = 1;
  });
}
