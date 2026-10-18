import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { NFCErrorCode } from '@taprails/tap-to-pay';
import { useAlert } from '../lib/AlertContext';
import { initMerchantSDK, isSDKReady } from '../lib/sdk';
import { checkNfcStatus, openNfcSettings, isAndroid } from '../lib/nfc';
import { config } from '../config';

import { TerminalHeader } from '../components/TerminalHeader';
import { AmountKeypad } from '../components/AmountKeypad';
import { PaymentModal } from '../components/PaymentModal';
import { ReceiptCard } from '../components/ReceiptCard';

export const POSTerminalScreen: React.FC = () => {
  const { showAlert } = useAlert();

  const [amountStr, setAmountStr] = useState('');
  const [sdkReady, setSdkReady] = useState(false);
  const [nfcState, setNfcState] = useState({ supported: true, enabled: true });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<any>(null);

  // Initialize SDK on app startup
  useEffect(() => {
    const startup = async () => {
      const nfc = await checkNfcStatus();
      setNfcState(nfc);

      if (!config.apiKey || !config.merchantId || config.apiKey.includes('your_api_key')) {
        setSdkReady(false);
        showAlert(
          'Credentials Required',
          'Please configure TAPRAILS_API_KEY and TAPRAILS_MERCHANT_ID in your .env file to enable the POS terminal.'
        );
        return;
      }

      try {
        await initMerchantSDK();
        setSdkReady(isSDKReady());
      } catch (err: any) {
        setSdkReady(false);
        showAlert(
          'SDK Initialization Error',
          err?.message || 'Could not connect to TapRails relay. Check your API credentials and network.'
        );
      }
    };
    startup();
  }, []);

  // Keypad Handlers
  const handleKeyPress = (char: string) => {
    if (char === '.') {
      if (amountStr.includes('.')) return;
      if (!amountStr) {
        setAmountStr('0.');
        return;
      }
    }
    if (amountStr.includes('.')) {
      const parts = amountStr.split('.');
      if (parts[1] && parts[1].length >= 2) return;
    }
    if (amountStr.length >= 8) return;
    setAmountStr((prev) => prev + char);
  };

  const handleDelete = () => setAmountStr((prev) => prev.slice(0, -1));
  const handleClear = () => setAmountStr('');
  const handleQuickAdd = (amt: string) => {
    const cur = parseFloat(amountStr) || 0;
    setAmountStr((cur + parseFloat(amt)).toFixed(2));
  };

  // Pre-flight NFC Checks & Start Payment
  const handleStartPayment = async () => {
    if (!isAndroid) {
      showAlert(
        'Android Device Required',
        'Merchant Host Card Emulation (HCE) requires an Android device with NFC. iOS does not support terminal mode.'
      );
      return;
    }

    const nfc = await checkNfcStatus();
    setNfcState(nfc);

    if (!nfc.supported) {
      showAlert('NFC Unsupported', 'This device lacks NFC hardware.');
      return;
    }

    if (!nfc.enabled) {
      showAlert(
        'NFC is Disabled',
        'Please turn on NFC in system settings to accept contactless tap-to-pay charges.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: openNfcSettings },
        ]
      );
      return;
    }

    if (!config.apiKey || !config.merchantId || config.apiKey.includes('your_api_key')) {
      showAlert(
        'Credentials Required',
        'Please configure TAPRAILS_API_KEY and TAPRAILS_MERCHANT_ID in your .env file before charging.'
      );
      return;
    }

    if (!isSDKReady()) {
      showAlert('Terminal Not Ready', 'TapRails SDK is initializing. Please try again in a moment.');
      await initMerchantSDK();
      return;
    }

    setShowPaymentModal(true);
  };

  // SDK Callbacks
  const handlePaymentComplete = (data: any) => {
    setShowPaymentModal(false);
    setLastReceipt(data);
    setAmountStr('');

    showAlert(
      'Payment Received! 🎉',
      `Settled $${data?.amount || amountStr} USDC.\nTx: ${data?.txHash?.slice(0, 14)}...`
    );
  };

  const handlePaymentError = (error: any) => {
    setShowPaymentModal(false);
    console.error('[TapRails] Payment error:', error);

    switch (error?.code) {
      case NFCErrorCode.NOT_SUPPORTED:
        showAlert('NFC Not Supported', 'Device does not support contactless cards.');
        break;
      case NFCErrorCode.NOT_ENABLED:
        showAlert('NFC Disabled', 'Enable NFC in your device settings to accept taps.');
        break;
      case NFCErrorCode.TIMEOUT:
        showAlert('Session Timed Out', 'No phone was tapped within the time limit. Please try again.');
        break;
      case NFCErrorCode.UNAUTHORIZED:
        showAlert('Auth Failed', 'Invalid TapRails API key or merchant ID.');
        break;
      case NFCErrorCode.NETWORK_ERROR:
        showAlert('Network Error', 'Cannot reach backend relay. Check internet connection.');
        break;
      default:
        showAlert('Payment Failed', error?.message || 'Payment could not be processed.');
    }
  };

  const parsedAmount = parseFloat(amountStr) || 0;
  const isZero = parsedAmount <= 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D12" />

      {/* Terminal Header & Status */}
      <TerminalHeader
        sdkReady={sdkReady}
        nfcEnabled={nfcState.enabled}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Amount Keypad & Input Hero */}
        <AmountKeypad
          amount={amountStr}
          onKeyPress={handleKeyPress}
          onDelete={handleDelete}
          onClear={handleClear}
          onQuickAdd={handleQuickAdd}
          onSubmit={handleStartPayment}
        />

        {/* Latest Settlement Receipt Card */}
        <ReceiptCard receipt={lastReceipt} />
      </ScrollView>

      {/* Payment Sheet Modal */}
      <PaymentModal
        visible={showPaymentModal}
        amount={!isZero ? parsedAmount.toFixed(2) : undefined}
        onClose={() => setShowPaymentModal(false)}
        onComplete={handlePaymentComplete}
        onError={handlePaymentError}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D12',
  },
  scroll: {
    paddingBottom: 36,
  },
});
