// E00-T02 · attaches the request context and echoes the correlation id.

import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import type { RequestContext } from '@garazo/server-core';
import { CORRELATION_ID_HEADER, createRequestContext } from './request-context';

/** Where the context is parked on the request object. */
export const REQUEST_CONTEXT_KEY = 'garazoRequestContext';

export interface RequestWithContext extends Request {
  [REQUEST_CONTEXT_KEY]?: RequestContext;
}

/**
 * Creates exactly one context per request, before any controller runs.
 *
 * The response header is set here rather than per-controller so that EVERY
 * response carries a correlation id — including error responses produced by
 * paths that never reached a controller at all.
 */
@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(request: RequestWithContext, response: Response, next: NextFunction): void {
    const context = createRequestContext(request.headers);
    request[REQUEST_CONTEXT_KEY] = context;
    response.setHeader(CORRELATION_ID_HEADER, context.correlationId);
    next();
  }
}

/**
 * Reads the context, or builds a fresh one if the middleware never ran.
 *
 * The fallback matters for error paths: a failure that bypasses middleware must
 * still produce a correlation id rather than crashing the error filter itself.
 */
export function contextOf(request: RequestWithContext): RequestContext {
  return request[REQUEST_CONTEXT_KEY] ?? createRequestContext(request.headers ?? {});
}
