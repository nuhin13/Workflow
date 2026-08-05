// E00-T02 · API composition root wiring.
//
// Registers ONLY the system module plus the request-context middleware and the
// error filter. No product module exists yet, and adding one here without its
// own epic would be an unauthorized surface.

import { Module, type MiddlewareConsumer, type NestModule } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { registerModuleBoundary } from '@garazo/server-core';
import { ApiErrorFilter } from './common/errors/api-error.filter';
import { RequestContextMiddleware } from './common/request/request-context.middleware';
import { SystemModule } from './system/system.module';

export const apiModuleBoundary = registerModuleBoundary('api-root');

@Module({
  imports: [SystemModule],
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
