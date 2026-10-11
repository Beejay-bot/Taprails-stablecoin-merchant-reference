import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useTheme } from '../lib/ThemeProvider';
import { useAlert } from '../lib/AlertContext';
import { DEFAULT_CONFIG } from '../config';
import { initMerchantSDK, isSDKReady } from '../lib/sdk';
import { checkNfcStatus, openNfcSettings, isAndroid } from '../lib/nfc';
import { NFCErrorCode } from '@taprails/tap-to-pay';
import type { PaymentChain } from '@taprails/tap-to-pay';
import type { MerchantCredentials, PaymentReceipt } from '../types';
import { PaymentFlowModal } from '../components/PaymentFlowModal';
import { TerminalSettingsModal } from '../components/TerminalSettingsModal';
import {
  Settings,
  Delete,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Radio,
  ExternalLink,
} from 'lucide-react-native';

const QUICK_AMOUNTS = ['5', '10', '25', '50'];

export const POSTerminalScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const { showAlert } = useAlert();

  // Credentials & SDK State
  const [credentials, setCredentials] = useState<MerchantCredentials>(DEFAULT_CONFIG);
  const [sdkReady, setSdkReady] = useState(false);
  const [nfcState, setNfcState] = useState<{ supported: boolean; enabled: boolean }>({
    supported: true,
    enabled: true,
  });

  // POS State
  const [amountStr, setAmountStr] = useState('');
  const [selectedChain, setSelectedChain] = useState<PaymentChain>('base');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);

  // Initialize SDK on mount
  useEffect(() => {
    bootstrapTerminal(credentials);
  }, []);

  const bootstrapTerminal = async (creds: MerchantCredentials) => {
    // Check NFC status
    const nfc = await checkNfcStatus();
    setNfcState(nfc);

    try {
      await initMerchantSDK(creds);
      setSdkReady(isSDKReady());
    } catch (err: any) {
      setSdkReady(false);
      showAlert(
        'SDK Initialization Error',
        err?.message || 'Could not connect to TapRails relay. Check your API credentials and network.'
      );
    }
  };

  // Keypad Actions
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

  const handleDelete = () => {
    setAmountStr((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setAmountStr('');
  };

  const handleQuickAdd = (amt: string) => {
    const current = parseFloat(amountStr) || 0;
    const added = current + parseFloat(amt);
    setAmountStr(added.toFixed(2));
  };

  // Start Tap-to-Pay Payment
  const handleStartPayment = async () => {
    if (!isAndroid) {
      showAlert(
        'Android Device Required',
        'Merchant Host Card Emulation (HCE) requires an Android device with NFC. iOS does not support HCE terminal mode.'
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
        'Please turn on NFC in system settings to accept tap payments.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: openNfcSettings },
        ]
      );
      return;
    }

    if (!isSDKReady()) {
      showAlert('Terminal Not Ready', 'TapRails SDK is re-connecting. Please retry in a moment.');
      await bootstrapTerminal(credentials);
      return;
    }

    // Launch the SDK PaymentFlowManager modal
    setShowPaymentModal(true);
  };

  // Payment Callbacks
  const handlePaymentComplete = (data: any) => {
    setShowPaymentModal(false);
    const newReceipt: PaymentReceipt = {
      paymentId: data?.paymentId || String(Date.now()),
      amount: data?.amount || (parseFloat(amountStr) || 0).toFixed(2),
      txHash: data?.txHash || '0x...',
      chain: selectedChain,
      timestamp: Date.now(),
    };
    setReceipts((prev) => [newReceipt, ...prev]);
    setAmountStr('');

    showAlert(
      'Payment Received! 🎉',
      `Successfully settled $${newReceipt.amount} USDC on ${selectedChain.toUpperCase()}.`
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
  const isZeroAmount = parsedAmount <= 0;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.background}
      />

      {/* Top Status Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={[
              styles.statusPill,
              sdkReady && nfcState.enabled ? styles.statusPillOnline : styles.statusPillOffline,
            ]}
            onPress={!nfcState.enabled ? openNfcSettings : undefined}
          >
            <View
              style={[
                styles.statusDot,
                sdkReady && nfcState.enabled ? styles.dotGreen : styles.dotOrange,
              ]}
            />
            <Text style={styles.statusText}>
              {!nfcState.enabled
                ? 'NFC Disabled (Tap to enable)'
                : sdkReady
                ? 'Ready for Taps'
                : 'Connecting...'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.aidLabel}>AID: {credentials.aid.slice(0, 10)}...</Text>
        </View>

        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => setShowSettingsModal(true)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Settings size={22} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Amount Hero */}
        <View style={styles.heroContainer}>
          <Text style={styles.heroCurrency}>$</Text>
          <Text style={styles.heroAmount}>
            {amountStr || '0.00'}
          </Text>
          <Text style={styles.heroBadge}>USDC</Text>
        </View>

        {/* Chain Selector */}
        <View style={styles.chainSelectorRow}>
          {(['base', 'polygon'] as const).map((ch) => (
            <TouchableOpacity
              key={ch}
              style={[
                styles.chainBtn,
                selectedChain === ch && styles.chainBtnActive,
              ]}
              onPress={() => setSelectedChain(ch)}
            >
              <Radio
                size={14}
                color={selectedChain === ch ? theme.colors.purpleLight : theme.colors.text40}
              />
              <Text
                style={[
                  styles.chainBtnText,
                  selectedChain === ch && styles.chainBtnTextActive,
                ]}
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
                      <Delete size={22} color={theme.colors.text} />
                    ) : (
                      <Text style={styles.keyBtnText}>{k}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* Main CTA: Tap-to-Pay Button */}
        <View style={styles.actionRow}>
          {amountStr ? (
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={handleClear}
              activeOpacity={0.7}
            >
              <RotateCcw size={20} color={theme.colors.text40} />
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.tapToPayBtn}
            onPress={handleStartPayment}
            activeOpacity={0.8}
          >
            <Text style={styles.tapToPayText}>
              {isZeroAmount ? 'Accept Open Amount' : `Charge $${parsedAmount.toFixed(2)} USDC`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent Session Settlements Log */}
        {receipts.length > 0 && (
          <View style={styles.receiptsSection}>
            <Text style={styles.receiptsTitle}>Recent Settlements</Text>
            {receipts.map((rcpt) => (
              <View key={rcpt.paymentId} style={styles.receiptCard}>
                <CheckCircle2 size={20} color={theme.colors.green} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.receiptAmount}>+${rcpt.amount} USDC</Text>
                  <Text style={styles.receiptSub}>
                    {rcpt.chain.toUpperCase()} · Tx: {rcpt.txHash.slice(0, 10)}...
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Terminal Settings Modal */}
      <TerminalSettingsModal
        visible={showSettingsModal}
        credentials={credentials}
        onSave={(newCreds) => {
          setCredentials(newCreds);
          bootstrapTerminal(newCreds);
        }}
        onClose={() => setShowSettingsModal(false)}
      />

      {/* TapRails Tap-to-Pay Flow Sheet */}
      <PaymentFlowModal
        visible={showPaymentModal}
        amount={!isZeroAmount ? parsedAmount.toFixed(2) : undefined}
        chain={selectedChain}
        onClose={() => setShowPaymentModal(false)}
        onComplete={handlePaymentComplete}
        onError={handlePaymentError}
      />
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingTop: 24,
      paddingBottom: 12,
    },
    headerLeft: {
      gap: 4,
    },
    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.surfaceElevated,
    },
    statusPillOnline: {
      backgroundColor: 'rgba(16,185,129,0.12)',
    },
    statusPillOffline: {
      backgroundColor: 'rgba(245,158,11,0.12)',
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    dotGreen: {
      backgroundColor: theme.colors.green,
    },
    dotOrange: {
      backgroundColor: theme.colors.amber,
    },
    statusText: {
      fontSize: 12,
      fontWeight: theme.font.semibold,
      color: theme.colors.text,
    },
    aidLabel: {
      fontSize: 11,
      color: theme.colors.text40,
      paddingLeft: 4,
    },
    settingsBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: theme.colors.surfaceElevated,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scroll: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: 40,
    },
    heroContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 24,
      gap: 4,
    },
    heroCurrency: {
      fontSize: 32,
      fontWeight: theme.font.bold,
      color: theme.colors.purpleLight,
    },
    heroAmount: {
      fontSize: 54,
      fontWeight: theme.font.bold,
      color: theme.colors.text,
      letterSpacing: -1.5,
    },
    heroBadge: {
      fontSize: 12,
      fontWeight: theme.font.bold,
      color: theme.colors.purpleLight,
      backgroundColor: 'rgba(139,92,246,0.15)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      marginLeft: 6,
    },
    chainSelectorRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 12,
      marginBottom: 16,
    },
    chainBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    chainBtnActive: {
      borderColor: theme.colors.purpleLight,
      backgroundColor: 'rgba(124,58,237,0.15)',
    },
    chainBtnText: {
      fontSize: theme.fontSize.xs,
      fontWeight: theme.font.medium,
      color: theme.colors.text40,
    },
    chainBtnTextActive: {
      color: theme.colors.text,
    },
    chipsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 10,
      marginBottom: 20,
    },
    chip: {
      backgroundColor: theme.colors.surfaceElevated,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: theme.radius.full,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    chipText: {
      fontSize: theme.fontSize.sm,
      fontWeight: theme.font.semibold,
      color: theme.colors.text,
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
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.md,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    keyBtnText: {
      fontSize: 24,
      fontWeight: theme.font.semibold,
      color: theme.colors.text,
    },
    actionRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 4,
    },
    clearBtn: {
      width: 56,
      height: 56,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceElevated,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    tapToPayBtn: {
      flex: 1,
      height: 56,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.purple,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.colors.purple,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    tapToPayText: {
      fontSize: theme.fontSize.base,
      fontWeight: theme.font.bold,
      color: '#FFFFFF',
      letterSpacing: 0.3,
    },
    receiptsSection: {
      marginTop: 28,
    },
    receiptsTitle: {
      fontSize: theme.fontSize.sm,
      fontWeight: theme.font.bold,
      color: theme.colors.text40,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 10,
    },
    receiptCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: theme.colors.surface,
      padding: 14,
      borderRadius: theme.radius.md,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    receiptAmount: {
      fontSize: theme.fontSize.base,
      fontWeight: theme.font.bold,
      color: theme.colors.green,
    },
    receiptSub: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.text40,
      marginTop: 2,
    },
  });
