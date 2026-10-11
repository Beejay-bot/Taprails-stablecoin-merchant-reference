/**
 * sdk.ts — TapRails SDK Initialization Helper
 *
 * This file contains the minimum code needed to initialize the
 * TapRails SDK on the merchant side.
 */
import { ContactlessCryptoSDK } from '@taprails/tap-to-pay';
import { config } from '../config';

/**
 * Initialize the TapRails SDK with merchant credentials.
 */
export const initMerchantSDK = async (): Promise<void> => {
  await ContactlessCryptoSDK.initialize({
    apiKey: config.apiKey,
    apiUrl: config.apiUrl,
    environment: config.environment,
    merchantId: config.merchantId,
    aid: config.aid,
  });
};

/**
 * Check if the SDK is initialized and ready to accept payments.
 */
export const isSDKReady = (): boolean => {
  try {
    return ContactlessCryptoSDK.isInitialized();
  } catch {
    return false;
  }
};
