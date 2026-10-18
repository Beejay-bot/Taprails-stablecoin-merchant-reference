/// <reference types="node" />
/**
 * webhookVerification.ts — TapRails Webhook Signature & Replay Protection Helper
 *
 * Provides cryptographic signature verification for TapRails webhook payloads,
 * binding the request timestamp to the HMAC digest to prevent replay attacks.
 *
 * Attack Mitigation:
 * 1. Replay Attacks: Enforces an expiration window (default 300s) and binds the timestamp
 *    into the HMAC payload (`${timestamp}.${rawBody}`). An attacker replaying an old payload
 *    or altering the timestamp header will fail verification.
 * 2. Timing Attacks: Uses constant-time buffer comparison (`crypto.timingSafeEqual`)
 *    to prevent side-channel timing leaks.
 */

import crypto from 'crypto';

export interface WebhookVerificationOptions {
  /**
   * The raw, unparsed request body as a string or Buffer.
   * DO NOT pass an already-parsed JSON object; serialization changes byte order.
   */
  rawBody: string | Buffer;

  /**
   * Value of the `X-Webhook-Signature` header.
   */
  signature: string;

  /**
   * Value of the `X-Webhook-Timestamp` header (UNIX epoch seconds or ISO-8601 string).
   */
  timestamp: string | number;

  /**
   * The webhook secret configured for this endpoint in the TapRails Partner Dashboard.
   */
  secret: string;

  /**
   * Maximum allowed drift in seconds between the timestamp header and current server time.
   * Defaults to 300 seconds (5 minutes).
   */
  toleranceSeconds?: number;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  error?: string;
  timestamp?: number;
}

/**
 * Normalizes a timestamp from either UNIX epoch seconds, epoch milliseconds, or ISO-8601.
 * Returns UNIX epoch seconds.
 */
export const normalizeTimestampToSeconds = (timestamp: string | number): number => {
  if (typeof timestamp === 'number') {
    // If timestamp is in milliseconds (> 1e11), convert to seconds
    return timestamp > 1e11 ? Math.floor(timestamp / 1000) : Math.floor(timestamp);
  }

  // Attempt numeric string parse
  const numeric = Number(timestamp);
  if (!Number.isNaN(numeric) && numeric > 0) {
    return numeric > 1e11 ? Math.floor(numeric / 1000) : Math.floor(numeric);
  }

  // Attempt ISO 8601 string parse
  const parsed = Date.parse(timestamp);
  if (!Number.isNaN(parsed)) {
    return Math.floor(parsed / 1000);
  }

  return NaN;
};

/**
 * Computes the expected HMAC-SHA256 signature for a webhook delivery,
 * binding the timestamp and raw body together.
 *
 * Canonical format: HMAC_SHA256(`${timestampInSeconds}.${rawBody}`, secret)
 */
export const computeWebhookSignature = (
  rawBody: string | Buffer,
  timestampInSeconds: number,
  secret: string
): string => {
  const bodyString = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf-8');
  const payloadToSign = `${timestampInSeconds}.${bodyString}`;

  return crypto
    .createHmac('sha256', secret)
    .update(payloadToSign)
    .digest('hex');
};

/**
 * Verifies that a webhook request originated from TapRails and has not expired or been replayed.
 */
export const verifyWebhookSignature = (
  options: WebhookVerificationOptions
): WebhookVerificationResult => {
  const {
    rawBody,
    signature,
    timestamp,
    secret,
    toleranceSeconds = 300,
  } = options;

  if (!rawBody) {
    return { isValid: false, error: 'Missing rawBody for webhook signature verification.' };
  }

  if (!signature) {
    return { isValid: false, error: 'Missing signature header (X-Webhook-Signature).' };
  }

  if (!timestamp) {
    return { isValid: false, error: 'Missing timestamp header (X-Webhook-Timestamp).' };
  }

  if (!secret) {
    return { isValid: false, error: 'Missing webhook secret.' };
  }

  const timestampInSeconds = normalizeTimestampToSeconds(timestamp);
  if (Number.isNaN(timestampInSeconds)) {
    return { isValid: false, error: 'Invalid timestamp format in X-Webhook-Timestamp header.' };
  }

  // Check timestamp tolerance window (anti-replay)
  const currentServerTimeSeconds = Math.floor(Date.now() / 1000);
  const timeDifference = Math.abs(currentServerTimeSeconds - timestampInSeconds);

  if (timeDifference > toleranceSeconds) {
    return {
      isValid: false,
      error: `Webhook timestamp outside tolerance window (${timeDifference}s > ${toleranceSeconds}s drift). Request may be a replay attack.`,
      timestamp: timestampInSeconds,
    };
  }

  // Compute canonical expected signature
  const expectedSignature = computeWebhookSignature(rawBody, timestampInSeconds, secret);

  const cleanReceivedSignature = signature.trim().toLowerCase();
  const cleanExpectedSignature = expectedSignature.toLowerCase();

  // Constant-time comparison
  const expectedBuffer = Buffer.from(cleanExpectedSignature, 'hex');
  const receivedBuffer = Buffer.from(cleanReceivedSignature, 'hex');

  if (expectedBuffer.length !== receivedBuffer.length) {
    return { isValid: false, error: 'Signature length mismatch.', timestamp: timestampInSeconds };
  }

  const matches = crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

  return {
    isValid: matches,
    error: matches ? undefined : 'HMAC signature does not match.',
    timestamp: timestampInSeconds,
  };
};
