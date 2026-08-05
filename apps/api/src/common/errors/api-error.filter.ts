// E00-T02 · the single exit for every failure (EARS-E00-4).

import {
  Catch,
  HttpException,
  NotFoundException,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiError, ApiErrorCode, statusForApiErrorCode, toApiError } from './api-error';
import { CORRELATION_ID_HEADER } from '../request/request-context';
import { contextOf, type RequestWithContext } from '../request/request-context.middleware';

/**
 * Catches everything and emits the one envelope.
 *
 * `@Catch()` with no argument is deliberate: a filter that only caught our own
 * ApiError would let framework and runtime errors escape in their default
 * shapes, which is exactly where stack traces and internal messages leak.
 */
@Catch()
export class ApiErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    const request = http.getRequest<RequestWithContext>();
    const context = contextOf(request);

    const apiError = this.toApiErrorLike(exception);
    const envelope = toApiError(apiError, context);

    // Set again here because an error may have short-circuited the middleware.
    response.setHeader(CORRELATION_ID_HEADER, context.correlationId);
    response.status(statusForApiErrorCode(envelope.error.code)).json(envelope);
  }

  /**
   * Normalizes framework exceptions into our own error vocabulary.
   *
   * Only the STATUS of a framework exception is trusted; its message is
   * discarded. Nest's default messages happily include the offending path and
   * validation detail, which would defeat the redaction this filter exists for.
   */
  private toApiErrorLike(exception: unknown): unknown {
    if (exception instanceof ApiError) {
      return exception;
    }

    if (exception instanceof NotFoundException) {
      return new ApiError(ApiErrorCode.SystemNotFound);
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      if (status === 400) {
        return new ApiError(ApiErrorCode.ValidationInvalidField);
      }
      if (status === 404) {
        return new ApiError(ApiErrorCode.SystemNotFound);
      }
      if (status === 503) {
        return new ApiError(ApiErrorCode.SystemNotReady);
      }
    }

    // Anything unrecognized collapses to a detail-free internal error.
    return exception;
  }
}
