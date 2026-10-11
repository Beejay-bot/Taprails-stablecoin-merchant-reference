// @ts-ignore
import {
  TAPRAILS_API_KEY,
  TAPRAILS_API_URL,
  TAPRAILS_MERCHANT_ID,
  TAPRAILS_DEFAULT_AID,
  APP_ENV,
} from '@env';

/**
 * Default sandbox credentials for immediate out-of-the-box testing
 */
export const DEFAULT_CONFIG = {
  // Your TapRails API Key (sk_test_... or sk_live_...)
  apiKey: TAPRAILS_API_KEY || '1108c15451d9d5d1b4db61ae1dbe91a891b61c567b446980664e06ecb1dc3389',

  // TapRails backend API URL (http://localhost:3001 or your LAN IP)
  apiUrl: TAPRAILS_API_URL || 'http://localhost:3001',

  // Registered merchant account ID on TapRails
  merchantId: TAPRAILS_MERCHANT_ID || 'cmoj77g2p00048qgycrcy1bre',

  // TapRails Application Identifier (AID) matching the HCE service
  aid: TAPRAILS_DEFAULT_AID || 'F05452FD994ED60006',

  // Environment: 'sandbox' (Base Sepolia) or 'production' (Base Mainnet)
  environment: ((APP_ENV || 'sandbox').toLowerCase() === 'production'
    ? 'production'
    : 'sandbox') as 'sandbox' | 'production',
};
