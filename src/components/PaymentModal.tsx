import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { PaymentFlowManager } from '@taprails/tap-to-pay';
import type { PaymentChain } from '@taprails/tap-to-pay';

interface PaymentModalProps {
  visible: boolean;
  amount?: string;
  chain?: PaymentChain;
  onClose: () => void;
  onComplete: (data: any) => void;
  onError: (error: any) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  amount,
  chain,
  onClose,
  onComplete,
  onError,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      {/* Backdrop: Tapping outside is disabled to prevent killing the active HCE NFC transceive session */}
      <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} />

      <View style={styles.sheetContainer} pointerEvents="box-none">
        <View style={styles.sheet}>
          <PaymentFlowManager
            config={{
              type: 'merchant',
              onComplete,
              onCancel: onClose,
              onError,
            }}
            amount={amount}
            onMerchantCancel={onClose}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
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
