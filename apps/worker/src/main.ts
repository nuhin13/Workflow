// E00-T01/T03 · worker composition root.

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import {
  clearWorkerReady,
  createStructuredLogger,
  installGracefulShutdown,
  loadRuntimeConfig,
  markWorkerReady,
  ConfigError,
} from '@garazo/runtime-config';
import { WorkerModule } from './worker.module';

export async function bootstrapWorker(): Promise<void> {
  const config = loadRuntimeConfig('worker', process.env);
  const logger = createStructuredLogger('worker', undefined, config.logLevel);

  const app = await NestFactory.createApplicationContext(WorkerModule, { logger: false });
  app.enableShutdownHooks();

  // The marker is written only AFTER bootstrap succeeds. Writing it earlier
  // would report a worker healthy while it is still assembling itself.
  await markWorkerReady();
  logger.info('worker started', { concurrency: config.workerConcurrency, appEnv: config.appEnv });

  await new Promise<void>((resolve) => {
    // The worker has no HTTP server and, until a queue lands, no timers or
    // sockets of its own. Signal handlers alone do NOT hold Node's event loop
    // open, so without this handle the process would boot and exit immediately
    // — which is indistinguishable from a crash in a container log.
    const keepAlive = setInterval(() => {}, 60_000);

    installGracefulShutdown(
      {
        async close(): Promise<void> {
          clearInterval(keepAlive);
          // Stop reporting ready before closing, so an orchestrator routes no
          // further work to a worker that is on its way down.
          await clearWorkerReady();
          await app.close();
          resolve();
        },
      },
      { onShutdown: (signal) => logger.info('shutting down', { signal }) },
    );
  });
}

if (require.main === module) {
  bootstrapWorker().catch((error: unknown) => {
    const logger = createStructuredLogger('worker');
    if (error instanceof ConfigError) {
      logger.error('invalid configuration', { keys: error.keys });
    } else {
      logger.error('worker failed to start', { error });
    }
    process.exitCode = 1;
  });
}
