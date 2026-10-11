# TapRails POS — Merchant SDK Reference

> **The ultra-minimal reference implementation for merchants accepting contactless Tap-to-Pay stablecoin payments using `@taprails/tap-to-pay`.**

This repository is designed specifically for first-time developers. All boilerplate, navigation stacks, database models, and complex auth flows have been stripped away, leaving a **single-screen POS terminal** that accepts USDC tap-to-pay charges on Android.

---

## ⚡ Quick Start

### 1. Get Credentials from the Partner Dashboard
Before running the terminal, log in to the **[TapRails Partner Dashboard](https://dashboard.taprails.xyz)** to get your merchant credentials:
- **API Key** (`TAPRAILS_API_KEY`): Found under **Developers > API Keys**.
- **Merchant ID** (`TAPRAILS_MERCHANT_ID`): Create a merchant through the **[API](https://docs.taprails.xyz/api-reference/management/merchants/create-merchant)**.
- **AID** (`TAPRAILS_DEFAULT_AID`): The unique Application Identifier assigned to your organization (e.g., `F05452FD994ED60006`).

Copy `.env.example` to `.env` and input your dashboard credentials:
```bash
cp .env.example .env
```

```env
TAPRAILS_API_KEY=sk_test_your_api_key
TAPRAILS_API_URL=http://sandbox.taprails.xyz or https://api.taprails.xyz
TAPRAILS_MERCHANT_ID=your_merchant_id
TAPRAILS_DEFAULT_AID=F05452FD994ED60006
APP_ENV=sandbox
```

### 2. Install & Run

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
Initialize `ContactlessCryptoSDK` with the merchant credentials retrieved from your **TapRails Partner Dashboard** when your app boots:

```typescript
import { ContactlessCryptoSDK } from '@taprails/tap-to-pay';

await ContactlessCryptoSDK.initialize({
  apiKey: 'sk_test_your_api_key',     // API key from Partner Dashboard
  apiUrl: 'http://sandbox.taprails.xyz',     // or https://api.taprails.xyz
  environment: 'sandbox',              // 'sandbox' or 'production'
  merchantId: 'merchant_id',      // Merchant ID from any merchant created under your organization
  aid: 'F05452FD994ED60006',           // AID registered in Partner Dashboard
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
    onComplete: (data) => {
      console.log('Payment Settled!', data.txHash, data.amount);
    },
    onCancel: () => setModalVisible(false),
    onError: (err) => console.error('Payment Error', err),
  }}
  amount="15.00" // Pre-filled amount (skips manual entry) or undefined for open keypad
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

4. **Partner Dashboard AID Registration**:  
   The AID in `.env` (`TAPRAILS_DEFAULT_AID`) and in `android/app/src/main/res/xml/aid_list.xml` must match the AID assigned to your merchant terminal profile in the **TapRails Partner Dashboard**.

---

## 🤖 Android Native Configuration

If you are setting up a fresh React Native project or integrating `@taprails/tap-to-pay` into an existing app, follow the official **[TapRails Android Setup Documentation](https://docs.taprails.xyz/installation/android)**.

Here is the checklist of items and files required on the Android side:

### 1. Requirements
- `minSdkVersion` **23** or higher
- Android device equipped with NFC hardware

### 2. App-Level `android/app/build.gradle`
Ensure `minSdkVersion` is at least 23, and add the Jetpack DataStore libraries required by `react-native-keychain` along with the Kotlin stdlib resolution strategy:

```gradle
android {
    defaultConfig {
        minSdkVersion 23       // Required for Keychain & NFC APIs
        // ...
    }
}

dependencies {
    // Required by react-native-keychain v8
    implementation "androidx.datastore:datastore-core:1.0.0"
    implementation "androidx.datastore:datastore-preferences:1.0.0"
    implementation "androidx.datastore:datastore-preferences-core:1.0.0"

    // Fix Kotlin stdlib version conflicts
    configurations.all {
        resolutionStrategy {
            force "org.jetbrains.kotlin:kotlin-stdlib:1.8.0"
            force "org.jetbrains.kotlin:kotlin-stdlib-jdk7:1.8.0"
            force "org.jetbrains.kotlin:kotlin-stdlib-jdk8:1.8.0"
        }
    }
}
```

### 3. Project-Level `android/build.gradle`
Ensure Kotlin is configured inside the `buildscript` block:

```gradle
buildscript {
    ext {
        kotlinVersion = "1.8.0"
    }
    dependencies {
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion")
    }
}
```

### 4. `android/app/src/main/AndroidManifest.xml` — Permissions & HCE Service
Declare NFC hardware permissions and register the **`TapRailsHCEService`** Host Card Emulation service inside `<application>`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

  <!-- NFC Permissions & Features -->
  <uses-permission android:name="android.permission.NFC" />
  <uses-feature android:name="android.hardware.nfc" android:required="true" />
  <uses-feature android:name="android.hardware.nfc.hce" android:required="true" />

  <application ...>

    <!-- TapRails HCE Service (merchant terminal NFC emulation) -->
    <service
      android:name="com.taprails.hce.TapRailsHCEService"
      android:exported="true"
      android:enabled="true"
      android:permission="android.permission.BIND_NFC_SERVICE">
      <intent-filter>
        <action android:name="android.nfc.cardemulation.action.HOST_APDU_SERVICE" />
        <category android:name="android.intent.category.DEFAULT"/>
      </intent-filter>
      <meta-data
        android:name="android.nfc.cardemulation.host_apdu_service"
        android:resource="@xml/aid_list" />
      </service>

  </application>
</manifest>
```

> **Note**: `android:enabled="true"` is required so Android OS can discover the HCE service. The active session lifecycle is toggled dynamically by the SDK's JS bridge.

### 5. AID List XML (`android/app/src/main/res/xml/aid_list.xml`)
Create `android/app/src/main/res/xml/aid_list.xml` with your organization's unique AID from the **[Partner Dashboard](https://dashboard.taprails.xyz)**:

```xml
<host-apdu-service
  xmlns:android="http://schemas.android.com/apk/res/android"
  android:description="@string/app_name"
  android:requireDeviceUnlock="true">
  <aid-group android:category="other" android:description="@string/app_name">
    <!-- Replace with your unique AID assigned in the Partner Dashboard -->
    <aid-filter android:name="F05452FD994ED60006" />
  </aid-group>
</host-apdu-service>
```

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
│   ├── build.gradle           # Kotlin buildscript configuration
│   └── app/
│       ├── build.gradle       # minSdkVersion 23 + DataStore dependencies
│       └── src/main/
│           ├── AndroidManifest.xml # NFC permissions & TapRailsHCEService declaration
│           └── res/xml/aid_list.xml # TapRails AID filters (e.g. F05452FD994ED60006)
├── .env.example               # Sample credentials
└── package.json
```

---

## 📄 License

MIT © TapRails
