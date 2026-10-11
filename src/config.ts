// @ts-ignore
import {
  TAPRAILS_API_KEY,
  TAPRAILS_API_URL,
  TAPRAILS_MERCHANT_ID,
  TAPRAILS_DEFAULT_AID,
  APP_ENV,
} from '@env';

export const config = {
  // TapRails Merchant API Key (sk_test_... or sk_live_...)
  apiKey: TAPRAILS_API_KEY || '1108c15451d9d5d1b4db61ae1dbe91a891b61c567b446980664e06ecb1dc3389',

  // TapRails Backend API URL
  apiUrl: TAPRAILS_API_URL || 'http://localhost:3001',

  // Merchant Account ID
  merchantId: TAPRAILS_MERCHANT_ID || 'cmoj77g2p00048qgycrcy1bre',

  // TapRails Application Identifier (AID) registered for your terminal
  aid: TAPRAILS_DEFAULT_AID || 'F05452FD994ED60006',

  // Settlement Network Environment ('sandbox' or 'production')
  environment: ((APP_ENV || 'sandbox').toLowerCase() === 'production'
    ? 'production'
    : 'sandbox') as 'sandbox' | 'production',
};
