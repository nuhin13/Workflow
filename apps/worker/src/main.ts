import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';

/// Boots the worker composition root and stays resident until the process is
/// asked to stop.
///
/// The worker has no HTTP server and, until a queue lands in a later task, no
/// timers or sockets of its own. Signal handlers alone do NOT hold Node's event
/// loop open, so without an explicit keep-alive handle the process would boot
/// and exit immediately — which looks identical to a crash. The long interval
/// below is that handle; it does no work and is cleared on shutdown.
export async function bootstrapWorker(): Promise<void> {
  const app = await NestFactory.createApplicationContext(WorkerModule, { logger: false });

  await new Promise<void>((resolve) => {
    const keepAlive = setInterval(() => {}, 60_000);

    const stop = (): void => {
      process.off('SIGINT', stop);
      process.off('SIGTERM', stop);
      clearInterval(keepAlive);
      void app.close().then(resolve);
    };

    process.once('SIGINT', stop);
    process.once('SIGTERM', stop);
  });
}

if (require.main === module) {
  bootstrapWorker().catch((error: unknown) => {
    console.error('Garazo worker failed to start.', error);
    process.exitCode = 1;
  });
}
