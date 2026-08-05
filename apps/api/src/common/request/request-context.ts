// E00-T02 · request context creation from untrusted headers (NFR-SEC-01).

import { randomUUID } from 'node:crypto';
import { anonymousContext, type RequestContext } from '@garazo/server-core';

export const CORRELATION_ID_HEADER = 'x-correlation-id';

/** 1–128 printable ASCII characters, matching CorrelationId in the contract. */
const SAFE_CORRELATION_ID = /^[\x20-\x7E]{1,128}$/;

export type IncomingHeaders = Readonly<Record<string, string | string[] | undefined>>;

/**
 * Accepts a client-supplied correlation id only when it is safe, otherwise
 * mints one.
 *
 * A client id is echoed purely so a caller can stitch its own logs together. It
 * is never identity and never authority. Rejecting anything outside printable
 * ASCII keeps control characters and newlines out of log lines, which is how
 * log-injection gets in.
 */
export function resolveCorrelationId(headers: IncomingHeaders): string {
  const raw = headers[CORRELATION_ID_HEADER];
  // A repeated header arrives as an array; there is no principled way to choose
  // among conflicting values, so treat it as absent.
  const supplied = typeof raw === 'string' ? raw : undefined;

  if (supplied !== undefined && SAFE_CORRELATION_ID.test(supplied)) {
    return supplied;
  }
  return randomUUID();
}

/**
 * Builds the immutable per-request context.
 *
 * E00 has no authentication, so the actor is always anonymous and the workshop
 * scope is always none. Crucially, no header can change that: there is no code
 * path here that reads a workshop id from the request. Authority arrives in E01
 * from a verified session, not from input.
 */
export function createRequestContext(headers: IncomingHeaders): RequestContext {
  return anonymousContext(resolveCorrelationId(headers), Date.now());
}
