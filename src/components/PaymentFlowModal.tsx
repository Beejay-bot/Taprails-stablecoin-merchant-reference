/**
 * PaymentFlowModal.tsx — Merchant Bottom Sheet Modal for Tap-to-Pay
 *
 * This component hosts the SDK's built-in <PaymentFlowManager />.
 * It demonstrates how to trigger the contactless payment screen with an amount.
 *
 * IMPORTANT FOR DEVELOPERS:
 * We intentionally prevent closing the modal by tapping outside (the backdrop).
 * If the merchant closes the modal while an NFC session is in progress, the Android
 * Host Card Emulation (HCE) service is abruptly terminated, causing a "transceive fail"
 * error on the customer's phone. Always let the merchant use the SDK's built-in Cancel button.
 */
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { PaymentFlowManager } from '@taprails/tap-to-pay';
import type { PaymentChain } from '@taprails/tap-to-pay';
import { useTheme } from '../lib/ThemeProvider';

interface PaymentFlowModalProps {
  visible: boolean;
  amount?: string;
  chain?: PaymentChain;
  onClose: () => void;
  onComplete: (data: any) => void;
  onError: (error: any) => void;
}

export const PaymentFlowModal: React.FC<PaymentFlowModalProps> = ({
  visible,
  amount,
  chain = 'base',
  onClose,
  onComplete,
  onError,
}) => {
  const { theme } = useTheme();

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      {/* Backdrop: tapping backdrop is disabled during active payment session */}
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} />

      <View style={styles.contentContainer} pointerEvents="box-none">
        <View style={[styles.sheet, { backgroundColor: theme.colors.background }]}>
          <PaymentFlowManager
            config={{
              type: 'merchant',
              chain,
              onComplete,
              onCancel: onClose,
              onError,
            }}
            amount={amount} // If provided, shows confirmation card; if omitted, shows keypad
            chain={chain}
            onMerchantCancel={onClose}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
});
