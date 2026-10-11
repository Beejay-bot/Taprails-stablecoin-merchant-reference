import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';

interface ReceiptCardProps {
  receipt: {
    amount?: string;
    txHash?: string;
  } | null;
}

export const ReceiptCard: React.FC<ReceiptCardProps> = ({ receipt }) => {
  if (!receipt) return null;

  return (
    <View style={styles.card}>
      <CheckCircle2 size={20} color="#10B981" />
      <View style={styles.content}>
        <Text style={styles.title}>Last Settlement</Text>
        <Text style={styles.sub}>
          ${receipt.amount} USDC · Tx: {receipt.txHash?.slice(0, 14)}...
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#16161F',
    padding: 14,
    borderRadius: 12,
    marginHorizontal: 24,
    marginTop: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  sub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
});
