/**
 * SMS sender port (E00-T01).
 *
 * Reserves a replaceable SMS adapter boundary. No provider SDK, credit
 * effect, or message content is implemented here — only the shape of a
 * provider-neutral send.
 */

/** Provider-neutral message identity and approved content reference. */
export interface SmsMessage {
  /** Idempotency identity for this send attempt. */
  readonly messageId: string;
  /** Reference to pre-approved template content; never raw customer text. */
  readonly templateRef: string;
}

/** Normalized result; no credit effect is performed here. */
export interface SmsSendResult {
  readonly accepted: boolean;
  /** Provider-neutral, opaque delivery reference. */
  readonly providerRef: string;
}

export interface SmsSenderPort {
  /**
   * @param message provider-neutral message identity and approved content reference.
   * @returns normalized result; no credit effect is performed here.
   */
  send(message: SmsMessage): Promise<SmsSendResult>;
}
