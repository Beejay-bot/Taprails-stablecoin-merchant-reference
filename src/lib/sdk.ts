/**
 * sdk.ts — TapRails SDK Initialization Helper
 *
 * This file shows the minimum code needed to initialize the TapRails SDK
 * on an Android merchant device to start accepting tap-to-pay payments.
 */
import { ContactlessCryptoSDK } from '@taprails/tap-to-pay';
import type { MerchantCredentials } from '../types';

/**
 * Step 1: Initialize the ContactlessCryptoSDK with merchant credentials.
 * Call this when your app launches or before starting a payment flow.
 */
export const initMerchantSDK = async (creds: MerchantCredentials): Promise<void> => {
  try {
    console.log('[TapRails] Initializing Merchant SDK:', {
      merchantId: creds.merchantId,
      aid: creds.aid,
      environment: creds.environment,
    });

    await ContactlessCryptoSDK.initialize({
      apiKey: creds.apiKey,
      apiUrl: creds.apiUrl,
      environment: creds.environment,
      merchantId: creds.merchantId,
      aid: creds.aid,
    });

    console.log('[TapRails] SDK initialization successful!');
  } catch (error) {
    console.error('[TapRails] SDK initialization failed:', error);
    throw error;
  }
};

/**
 * Check if the SDK is ready to process payments.
 */
export const isSDKReady = (): boolean => {
  try {
    return ContactlessCryptoSDK.isInitialized();
  } catch {
    return false;
  }
};

/**
 * Reset the current SDK session (e.g. on logout or switching credentials).
 */
export const resetSDKSession = (): void => {
  try {
    ContactlessCryptoSDK.reset();
  } catch (err) {
    console.warn('[TapRails] Error resetting SDK session:', err);
  }
};
