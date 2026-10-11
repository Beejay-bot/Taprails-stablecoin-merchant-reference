# TapRails POS — Merchant SDK Reference

> **The ultra-minimal reference implementation for merchants accepting contactless Tap-to-Pay crypto payments using `@taprails/tap-to-pay`.**

This repository is designed specifically for first-time developers. All boilerplate, navigation stacks, database models, and complex auth flows have been stripped away, leaving a **single-screen POS terminal** that accepts USDC tap-to-pay charges on Android.

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Reverse port for local backend testing (if using local API on port 3001)
adb reverse tcp:3001 tcp:3001

# 3. Launch on Android
npm run android
```

---

## 🎯 How It Works: The 3 Core Steps

Accepting tap-to-pay on the merchant side requires only 3 simple steps:

### 1. Initialize the SDK ([`src/lib/sdk.ts`](file:///src/lib/sdk.ts))
Initialize `ContactlessCryptoSDK` with your merchant credentials when your app boots:

```typescript
import { ContactlessCryptoSDK } from '@taprails/tap-to-pay';

await ContactlessCryptoSDK.initialize({
  apiKey: 'sk_test_your_api_key',
  apiUrl: 'http://localhost:3001', // or https://api.taprails.com
  environment: 'sandbox',          // 'sandbox' or 'production'
  merchantId: 'your_merchant_id',
  aid: 'F05452FD994ED60006',        // TapRails AID
});
```

---

### 2. Verify NFC Hardware ([`src/lib/nfc.ts`](file:///src/lib/nfc.ts))
Check that NFC is turned on before starting a payment session:

```typescript
import NfcManager from 'react-native-nfc-manager';

await NfcManager.start();
const isEnabled = await NfcManager.isEnabled();

if (!isEnabled) {
  // Direct user to Android NFC settings
  await NfcManager.goToNfcSetting();
}
```

---

### 3. Display the Tap-to-Pay Flow ([`App.tsx`](file:///App.tsx))
Mount `<PaymentFlowManager />` in your bottom sheet or modal. The SDK takes care of the NFC card emulation, animations, customer tap reception, and blockchain settlement:

```tsx
import { PaymentFlowManager } from '@taprails/tap-to-pay';

<PaymentFlowManager
  config={{
    type: 'merchant',
    chain: 'base', // 'base' or 'polygon'
    onComplete: (data) => {
      console.log('Payment Settled!', data.txHash, data.amount);
    },
    onCancel: () => setModalVisible(false),
    onError: (err) => console.error('Payment Error', err),
  }}
  amount="15.00" // Pre-filled amount (skips manual entry) or undefined for open keypad
  chain="base"
  onMerchantCancel={() => setModalVisible(false)}
/>
```

---

## 📱 Pre-filled vs. Open Amount Modes

The SDK adapts dynamically based on whether you pass the `amount` prop:

| Mode | Usage | What Merchant Sees |
|---|---|---|
| **Fixed Amount (Cart/POS)** | `<PaymentFlowManager amount="25.00" ... />` | Clean confirmation card showing `$25.00` with an "Accept Payment" button. |
| **Open Keypad Mode** | `<PaymentFlowManager ... />` *(no amount prop)* | Large `$` amount entry screen with quick-select chips (`+$5`, `+$10`, `+$25`, `+$50`) and numeric keypad. |

---

## ⚠️ Important Developer Rules

1. **Android Requirement**:  
   Due to Apple OS restrictions on background Host Card Emulation (HCE), the device acting as the **Merchant (terminal receiving payments)** must run on **Android**. Customers paying can use either iOS or Android.

2. **Never allow Backdrop Dismiss during active NFC**:  
   Closing the payment sheet while an NFC transceive session is in progress abruptly kills the Android HCE service, causing a "transceive fail" error on the customer's phone. Always let merchants exit using the SDK's built-in Cancel button.

3. **Android Permissions**:  
   Ensure your `android/app/src/main/AndroidManifest.xml` includes `NFC` and `NFC_HCE` features and declares the `com.taprails.hce.TapRailsHCEService` with `@xml/aid_list`.

---

## 📂 Minimal Project Layout

```
taprail-merchant-reference/
├── App.tsx                    # The entire POS Keypad & Tap-to-Pay screen
├── src/
│   ├── config.ts              # API credentials & network settings
│   └── lib/
│       ├── sdk.ts             # 25-line SDK initialization helper
│       ├── nfc.ts             # Simple NFC hardware status check
│       └── AlertContext.tsx   # Custom Neobank modal alert (replaces Alert.alert)
├── android/
│   └── app/src/main/
│       ├── AndroidManifest.xml# NFC HCE service & permissions
│       └── res/xml/aid_list.xml # TapRails AID filters (F05452FD994ED60006)
├── .env.example               # Sample credentials
└── package.json
```

---

## 📄 License

MIT © TapRails
