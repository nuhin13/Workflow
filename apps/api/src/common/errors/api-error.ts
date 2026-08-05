// E00-T02 · the one error shape this API returns (EARS-E00-4).
//
// Every failure — validation, missing route, unavailable dependency, unexpected
// crash — leaves through toApiError(). That is what makes redaction verifiable:
// there is a single place where an internal error becomes a wire response, so
// "no stack trace, no provider message, no config" is one rule, not a habit.

import type { RequestContext } from '@garazo/server-core';

/** Stable machine-readable codes. Mirrors ErrorCode in the OpenAPI contract. */
export const ApiErrorCode = {
  ValidationInvalidField: 'VALIDATION.INVALID_FIELD',
  SystemNotFound: 'SYSTEM.NOT_FOUND',
  SystemNotReady: 'SYSTEM.NOT_READY',
  SystemDatabaseUnavailable: 'SYSTEM.DATABASE_UNAVAILABLE',
  SystemInternalError: 'SYSTEM.INTERNAL_ERROR',
} as const;

export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];

export interface FieldError {
  readonly field: string;
  readonly messageKey: string;
}

export interface ApiErrorBody {
  readonly code: ApiErrorCode;
  readonly messageKey: string;
  readonly correlationId: string;
  readonly fieldErrors: readonly FieldError[];
}

export interface ApiErrorEnvelope {
  readonly error: ApiErrorBody;
}

/** Maps each code to its HTTP status and localization key. */
const CODE_METADATA: Record<ApiErrorCode, { status: number; messageKey: string }> = {
  [ApiErrorCode.ValidationInvalidField]: {
    status: 400,
    messageKey: 'errors.validationInvalidField',
  },
  [ApiErrorCode.SystemNotFound]: { status: 404, messageKey: 'errors.systemNotFound' },
  [ApiErrorCode.SystemNotReady]: { status: 503, messageKey: 'errors.systemNotReady' },
  [ApiErrorCode.SystemDatabaseUnavailable]: {
    status: 503,
    messageKey: 'errors.systemDatabaseUnavailable',
  },
  [ApiErrorCode.SystemInternalError]: { status: 500, messageKey: 'errors.systemInternalError' },
};

export function statusForApiErrorCode(code: ApiErrorCode): number {
  return CODE_METADATA[code].status;
}

/**
 * The only error type application code should throw.
 *
 * It carries a code and optional field errors — never a human sentence, so a
 * Bangla client and an English client render the same failure from the same
 * key (NFR-I18N-01).
 */
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly fieldErrors: readonly FieldError[];

  constructor(code: ApiErrorCode, fieldErrors: readonly FieldError[] = []) {
    super(code);
    this.name = 'ApiError';
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Translates ANY caught value into the wire envelope.
 *
 * Unknown errors deliberately collapse to SYSTEM.INTERNAL_ERROR with no detail:
 * an unexpected error is exactly the case most likely to carry a connection
 * string, a file path, or a provider payload, so nothing from it is copied out.
 * The correlation id is how an operator ties the response back to the log.
 */
export function toApiError(error: unknown, context: RequestContext): ApiErrorEnvelope {
  const code = error instanceof ApiError ? error.code : ApiErrorCode.SystemInternalError;
  const fieldErrors = error instanceof ApiError ? error.fieldErrors : [];

  return {
    error: {
      code,
      messageKey: CODE_METADATA[code].messageKey,
      correlationId: context.correlationId,
      fieldErrors,
    },
  };
}
