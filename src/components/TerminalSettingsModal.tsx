import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { useTheme } from '../lib/ThemeProvider';
import type { MerchantCredentials } from '../types';
import { X, Check } from 'lucide-react-native';

interface TerminalSettingsModalProps {
  visible: boolean;
  credentials: MerchantCredentials;
  onSave: (creds: MerchantCredentials) => void;
  onClose: () => void;
}

export const TerminalSettingsModal: React.FC<TerminalSettingsModalProps> = ({
  visible,
  credentials,
  onSave,
  onClose,
}) => {
  const { theme } = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);

  const [apiKey, setApiKey] = useState(credentials.apiKey);
  const [apiUrl, setApiUrl] = useState(credentials.apiUrl);
  const [merchantId, setMerchantId] = useState(credentials.merchantId);
  const [aid, setAid] = useState(credentials.aid);
  const [environment, setEnvironment] = useState(credentials.environment);

  const handleSave = () => {
    onSave({
      apiKey: apiKey.trim(),
      apiUrl: apiUrl.trim(),
      merchantId: merchantId.trim(),
      aid: aid.trim(),
      environment,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Terminal Credentials</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={theme.colors.text40} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Merchant ID</Text>
            <TextInput
              style={styles.input}
              value={merchantId}
              onChangeText={setMerchantId}
              placeholder="Merchant ID"
              placeholderTextColor={theme.colors.text20}
              autoCapitalize="none"
            />

            <Text style={styles.label}>Terminal AID</Text>
            <TextInput
              style={styles.input}
              value={aid}
              onChangeText={setAid}
              placeholder="e.g. F05452FD994ED60006"
              placeholderTextColor={theme.colors.text20}
              autoCapitalize="characters"
            />

            <Text style={styles.label}>API Key</Text>
            <TextInput
              style={styles.input}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="API Key"
              placeholderTextColor={theme.colors.text20}
              secureTextEntry
            />

            <Text style={styles.label}>API URL</Text>
            <TextInput
              style={styles.input}
              value={apiUrl}
              onChangeText={setApiUrl}
              placeholder="http://localhost:3001"
              placeholderTextColor={theme.colors.text20}
              autoCapitalize="none"
            />

            <Text style={styles.label}>Environment</Text>
            <View style={styles.envRow}>
              {(['sandbox', 'production'] as const).map((env) => (
                <TouchableOpacity
                  key={env}
                  style={[
                    styles.envBtn,
                    environment === env && styles.envBtnActive,
                  ]}
                  onPress={() => setEnvironment(env)}
                >
                  <Text
                    style={[
                      styles.envBtnText,
                      environment === env && styles.envBtnTextActive,
                    ]}
                  >
                    {env.toUpperCase()}
                  </Text>
                  {environment === env && (
                    <Check size={16} color={theme.colors.purpleLight} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save & Re-initialize SDK</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      padding: theme.spacing.lg,
      maxHeight: '85%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: theme.fontSize.lg,
      fontWeight: theme.font.bold,
      color: theme.colors.text,
    },
    closeBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.surfaceElevated,
      justifyContent: 'center',
      alignItems: 'center',
    },
    label: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.text70,
      fontWeight: theme.font.medium,
      marginBottom: 6,
    },
    input: {
      height: 48,
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.md,
      paddingHorizontal: 12,
      color: theme.colors.text,
      fontSize: theme.fontSize.base,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 16,
    },
    envRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 24,
    },
    envBtn: {
      flex: 1,
      flexDirection: 'row',
      height: 44,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceElevated,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    envBtnActive: {
      borderColor: theme.colors.purpleLight,
      backgroundColor: 'rgba(124,58,237,0.15)',
    },
    envBtnText: {
      fontSize: theme.fontSize.sm,
      fontWeight: theme.font.semibold,
      color: theme.colors.text40,
    },
    envBtnTextActive: {
      color: theme.colors.text,
    },
    saveBtn: {
      height: 52,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.purple,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    saveBtnText: {
      fontSize: theme.fontSize.base,
      fontWeight: theme.font.bold,
      color: '#FFFFFF',
    },
  });
