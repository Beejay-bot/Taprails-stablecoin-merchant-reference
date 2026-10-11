import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  TapRailsThemeProvider,
  PaymentFlowManager,
  NFCErrorCode,
} from '@taprails/tap-to-pay';
import type { PaymentChain } from '@taprails/tap-to-pay';
import { AlertProvider, useAlert } from './src/lib/AlertContext';
import { initMerchantSDK, isSDKReady } from './src/lib/sdk';
import { checkNfcStatus, openNfcSettings, isAndroid } from './src/lib/nfc';
import { config } from './src/config';
import { Delete, RotateCcw, CheckCircle2 } from 'lucide-react-native';

const QUICK_AMOUNTS = ['5', '10', '25', '50'];

function POSTerminal() {
  const { showAlert } = useAlert();

  const [amountStr, setAmountStr] = useState('');
  const [selectedChain, setSelectedChain] = useState<PaymentChain>(config.defaultChain);
  const [sdkReady, setSdkReady] = useState(false);
  const [nfcState, setNfcState] = useState({ supported: true, enabled: true });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<any>(null);

  // Initialize SDK on app startup
  useEffect(() => {
    const startup = async () => {
      const nfc = await checkNfcStatus();
      setNfcState(nfc);

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

  // Numeric Keypad Handlers
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

  // Trigger Tap-to-Pay Payment
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

    if (!isSDKReady()) {
      showAlert('Terminal Not Ready', 'TapRails SDK is initializing. Please try again in a moment.');
      await initMerchantSDK();
      return;
    }

    // Open Payment Modal
    setShowPaymentModal(true);
  };

  // SDK Callbacks
  const handlePaymentComplete = (data: any) => {
    setShowPaymentModal(false);
    setLastReceipt(data);
    setAmountStr('');

    showAlert(
      'Payment Received! 🎉',
      `Settled $${data?.amount || amountStr} USDC on ${selectedChain.toUpperCase()}.\nTx: ${data?.txHash?.slice(0, 14)}...`
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

      {/* Terminal Status Header */}
      <View style={styles.header}>
        <View style={styles.statusPill}>
          <View
            style={[
              styles.statusDot,
              sdkReady && nfcState.enabled ? styles.dotGreen : styles.dotOrange,
            ]}
          />
          <Text style={styles.statusText}>
            {!nfcState.enabled
              ? 'NFC Disabled'
              : sdkReady
              ? 'Terminal Online'
              : 'Connecting...'}
          </Text>
        </View>
        <Text style={styles.aidText}>AID: {config.aid.slice(0, 10)}...</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Amount Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroCurrency}>$</Text>
          <Text style={styles.heroAmount}>{amountStr || '0.00'}</Text>
          <Text style={styles.heroBadge}>USDC</Text>
        </View>

        {/* Chain Selector */}
        <View style={styles.chainRow}>
          {(['base', 'polygon'] as const).map((ch) => (
            <TouchableOpacity
              key={ch}
              style={[styles.chainBtn, selectedChain === ch && styles.chainBtnActive]}
              onPress={() => setSelectedChain(ch)}
            >
              <Text
                style={[styles.chainBtnText, selectedChain === ch && styles.chainBtnTextActive]}
              >
                {ch === 'base' ? 'Base Network' : 'Polygon'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Amount Chips */}
        <View style={styles.chipsRow}>
          {QUICK_AMOUNTS.map((amt) => (
            <TouchableOpacity
              key={amt}
              style={styles.chip}
              onPress={() => handleQuickAdd(amt)}
              activeOpacity={0.7}
            >
              <Text style={styles.chipText}>+${amt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Numeric POS Keypad */}
        <View style={styles.keypad}>
          {[
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
            ['.', '0', 'DEL'],
          ].map((row, rIdx) => (
            <View key={rIdx} style={styles.keyRow}>
              {row.map((k) => {
                const isDel = k === 'DEL';
                return (
                  <TouchableOpacity
                    key={k}
                    style={styles.keyBtn}
                    onPress={() => (isDel ? handleDelete() : handleKeyPress(k))}
                    activeOpacity={0.6}
                  >
                    {isDel ? (
                      <Delete size={22} color="#FFFFFF" />
                    ) : (
                      <Text style={styles.keyBtnText}>{k}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* Charge CTA */}
        <View style={styles.actionRow}>
          {amountStr ? (
            <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
              <RotateCcw size={20} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.chargeBtn}
            onPress={handleStartPayment}
            activeOpacity={0.8}
          >
            <Text style={styles.chargeBtnText}>
              {isZero ? 'Accept Open Amount' : `Charge $${parsedAmount.toFixed(2)} USDC`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Last Receipt */}
        {lastReceipt && (
          <View style={styles.receiptCard}>
            <CheckCircle2 size={20} color="#10B981" />
            <View style={{ flex: 1 }}>
              <Text style={styles.receiptTitle}>Last Settlement</Text>
              <Text style={styles.receiptSub}>
                ${lastReceipt?.amount} USDC · Tx: {lastReceipt?.txHash?.slice(0, 14)}...
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* TapRails Tap-to-Pay Payment Flow Modal */}
      {showPaymentModal && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} />
          <View style={styles.sheetContainer} pointerEvents="box-none">
            <View style={styles.sheet}>
              <PaymentFlowManager
                config={{
                  type: 'merchant',
                  chain: selectedChain,
                  onComplete: handlePaymentComplete,
                  onCancel: () => setShowPaymentModal(false),
                  onError: handlePaymentError,
                }}
                amount={!isZero ? parsedAmount.toFixed(2) : undefined}
                chain={selectedChain}
                onMerchantCancel={() => setShowPaymentModal(false)}
              />
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <TapRailsThemeProvider colorOverrides={{ primary: '#7C3AED' }}>
        <AlertProvider>
          <POSTerminal />
        </AlertProvider>
      </TapRailsThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D12',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#1E1E2A',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotGreen: { backgroundColor: '#10B981' },
  dotOrange: { backgroundColor: '#F59E0B' },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  aidText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 36,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 4,
  },
  heroCurrency: {
    fontSize: 32,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  heroAmount: {
    fontSize: 56,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -1.5,
  },
  heroBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8B5CF6',
    backgroundColor: 'rgba(139,92,246,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 6,
  },
  chainRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  chainBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#1E1E2A',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  chainBtnActive: {
    borderColor: '#8B5CF6',
    backgroundColor: 'rgba(124,58,237,0.15)',
  },
  chainBtnText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
  },
  chainBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  chipsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  chip: {
    backgroundColor: '#1E1E2A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  keypad: {
    gap: 8,
    marginBottom: 20,
  },
  keyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  keyBtn: {
    flex: 1,
    height: 56,
    backgroundColor: '#1E1E2A',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  keyBtnText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  clearBtn: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#1E1E2A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  chargeBtn: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chargeBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  receiptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#16161F',
    padding: 14,
    borderRadius: 12,
    marginTop: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  receiptTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  receiptSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  sheetContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#0D0D12',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
});
