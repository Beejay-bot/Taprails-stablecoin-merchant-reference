import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { openNfcSettings } from '../lib/nfc';

interface TerminalHeaderProps {
  sdkReady: boolean;
  nfcEnabled: boolean;
}

export const TerminalHeader: React.FC<TerminalHeaderProps> = ({
  sdkReady,
  nfcEnabled,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tap-to-Pay POS</Text>

      {/* Connection & NFC Status Pill */}
      <TouchableOpacity
        style={styles.statusPill}
        disabled={nfcEnabled}
        onPress={openNfcSettings}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.statusDot,
            sdkReady && nfcEnabled ? styles.dotGreen : styles.dotOrange,
          ]}
        />
        <Text style={styles.statusText}>
          {!nfcEnabled
            ? 'NFC Disabled (Tap to enable)'
            : sdkReady
            ? 'Ready for Taps'
            : 'Connecting...'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
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
});
