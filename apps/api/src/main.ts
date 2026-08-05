import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

export async function bootstrapApi(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: false });
  await app.listen(3000, '127.0.0.1');
}

if (require.main === module) {
  bootstrapApi().catch((error: unknown) => {
    console.error('Garazo API failed to start.', error);
    process.exitCode = 1;
  });
}
