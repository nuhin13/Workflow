// E00-T02 · system transport boundary. Thin by design: shape in, shape out.

import { Body, Controller, Get, HttpCode, Post, Req } from '@nestjs/common';
import type { RequestContext } from '@garazo/server-core';
import { ApiError, ApiErrorCode } from '../common/errors/api-error';
import { contextOf, type RequestWithContext } from '../common/request/request-context.middleware';
import { SystemService } from './system.service';

export interface LiveResponse {
  status: 'ok';
  correlationId: string;
}

export interface ReadyResponse {
  status: 'ready';
  checks: { database: 'up' | 'down' };
  correlationId: string;
}

export interface WalkingSkeletonResponse {
  status: 'persisted';
  visitCount: number;
  correlationId: string;
}

/**
 * Whether the diagnostic probe route may respond at all (EARS-E00-5/E00-11).
 *
 * Both conditions must hold, and the production check is separate from the flag
 * so that a mis-set flag in production still cannot expose the route. The flag
 * is read from the process environment only — a remote product or admin flag
 * must never be able to switch this on.
 *
 * The key names are `APP_ENV` and `WALKING_SKELETON_ENABLED`, matching the
 * validated contract in @garazo/runtime-config. They were previously `NODE_ENV`
 * and `GARAZO_FLAG_SYSTEM_WALKING_SKELETON`, which nothing ever set: the route
 * returned 404 in every environment, and the walking skeleton could not run at
 * all. One name per setting, defined in one place.
 */
export function isWalkingSkeletonEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  const isProduction = (env.APP_ENV ?? '').toLowerCase() === 'production';
  const flagEnabled = (env.WALKING_SKELETON_ENABLED ?? '').toLowerCase() === 'true';
  return !isProduction && flagEnabled;
}

@Controller('api/v1/system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get('live')
  live(@Req() request: RequestWithContext): LiveResponse {
    const context: RequestContext = contextOf(request);
    this.systemService.isLive();
    return { status: 'ok', correlationId: context.correlationId };
  }

  @Get('ready')
  async ready(@Req() request: RequestWithContext): Promise<ReadyResponse> {
    const context = contextOf(request);
    const result = await this.systemService.isReady();

    if (!result.ready) {
      // Throwing keeps the 503 body identical to every other error response.
      throw new ApiError(ApiErrorCode.SystemNotReady);
    }

    return {
      status: 'ready',
      checks: { database: result.database },
      correlationId: context.correlationId,
    };
  }

  @Post('walking-skeleton')
  // Nest answers 201 for POST by default. The contract specifies 200, and the
  // generated clients are built from that contract, so the default would put
  // the server and every client permanently out of step.
  @HttpCode(200)
  async walkingSkeleton(
    @Req() request: RequestWithContext,
    @Body() body: unknown,
  ): Promise<WalkingSkeletonResponse> {
    const context = contextOf(request);

    // Gate FIRST. Validating before checking availability would let a caller
    // tell a disabled route from a nonexistent one by the error it returns.
    if (!isWalkingSkeletonEnabled()) {
      throw new ApiError(ApiErrorCode.SystemNotFound);
    }

    assertEmptyObject(body);

    if (!this.systemService.hasProbe()) {
      throw new ApiError(ApiErrorCode.SystemDatabaseUnavailable);
    }

    try {
      const visitCount = await this.systemService.recordWalkingSkeletonVisit();
      return { status: 'persisted', visitCount, correlationId: context.correlationId };
    } catch {
      throw new ApiError(ApiErrorCode.SystemDatabaseUnavailable);
    }
  }
}

/**
 * The contract says the body is exactly `{}`.
 *
 * Rejecting unknown fields now, on a route that carries no data, sets the
 * precedent for every product endpoint: silently ignoring unexpected input is
 * how a client and server drift apart without either noticing.
 */
function assertEmptyObject(body: unknown): void {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new ApiError(ApiErrorCode.ValidationInvalidField, [
      { field: 'body', messageKey: 'errors.validationInvalidField' },
    ]);
  }

  const keys = Object.keys(body as Record<string, unknown>);
  if (keys.length > 0) {
    throw new ApiError(
      ApiErrorCode.ValidationInvalidField,
      keys.map((field) => ({ field, messageKey: 'errors.validationInvalidField' })),
    );
  }
}
