// ─── TapRails Merchant Reference Types ───────────────────────────────────────
import type { PaymentChain } from '@taprails/tap-to-pay';

export interface MerchantCredentials {
  apiKey: string;
  apiUrl: string;
  merchantId: string;
  aid: string;
  environment: 'sandbox' | 'production';
}

export interface PaymentReceipt {
  paymentId: string;
  amount: string;
  txHash: string;
  chain: PaymentChain;
  timestamp: number;
}
