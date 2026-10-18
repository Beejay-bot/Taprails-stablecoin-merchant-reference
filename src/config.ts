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
  apiKey: TAPRAILS_API_KEY || '',

  // TapRails Backend API URL (defaults to secure sandbox)
  apiUrl: TAPRAILS_API_URL || 'https://sandbox.taprails.xyz',

  // Merchant Account ID
  merchantId: TAPRAILS_MERCHANT_ID || '',

  // TapRails Application Identifier (AID) registered for your terminal
  aid: TAPRAILS_DEFAULT_AID || 'F05452FD994ED60006',

  // Settlement Network Environment ('sandbox' or 'production')
  environment: ((APP_ENV || 'sandbox').toLowerCase() === 'production'
    ? 'production'
    : 'sandbox') as 'sandbox' | 'production',
};
