import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Delete, RotateCcw } from 'lucide-react-native';

const QUICK_AMOUNTS = ['5', '10', '25', '50'];

const KEYPAD_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'DEL'],
];

interface AmountKeypadProps {
  amount: string;
  onKeyPress: (char: string) => void;
  onDelete: () => void;
  onClear: () => void;
  onQuickAdd: (amount: string) => void;
  onSubmit: () => void;
}

export const AmountKeypad: React.FC<AmountKeypadProps> = ({
  amount,
  onKeyPress,
  onDelete,
  onClear,
  onQuickAdd,
  onSubmit,
}) => {
  const parsed = parseFloat(amount) || 0;
  const isZero = parsed <= 0;

  return (
    <View style={styles.container}>
      {/* Amount Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroCurrency}>$</Text>
        <Text style={styles.heroAmount}>{amount || '0.00'}</Text>
        <Text style={styles.heroBadge}>USDC</Text>
      </View>

      {/* Quick Add Chips */}
      <View style={styles.chipsRow}>
        {QUICK_AMOUNTS.map((amt) => (
          <TouchableOpacity
            key={amt}
            style={styles.chip}
            onPress={() => onQuickAdd(amt)}
            activeOpacity={0.7}
          >
            <Text style={styles.chipText}>+${amt}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Keypad Grid */}
      <View style={styles.keypad}>
        {KEYPAD_ROWS.map((row, rIdx) => (
          <View key={rIdx} style={styles.keyRow}>
            {row.map((k) => {
              const isDel = k === 'DEL';
              return (
                <TouchableOpacity
                  key={k}
                  style={styles.keyBtn}
                  onPress={() => (isDel ? onDelete() : onKeyPress(k))}
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

      {/* Action CTA */}
      <View style={styles.actionRow}>
        {amount ? (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={onClear}
            activeOpacity={0.7}
          >
            <RotateCcw size={20} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={styles.chargeBtn}
          onPress={onSubmit}
          activeOpacity={0.8}
        >
          <Text style={styles.chargeBtnText}>
            {isZero ? 'Accept Open Amount' : `Charge $${parsed.toFixed(2)} USDC`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
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
});
