import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from './ThemeProvider';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertOptions {
  title: string;
  message?: string;
  buttons?: AlertButton[];
}

interface AlertContextType {
  showAlert: (title: string, message?: string, buttons?: AlertButton[]) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alertConfig, setAlertConfig] = useState<AlertOptions | null>(null);
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const [visible, setVisible] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const showAlert = useCallback((title: string, message?: string, buttons?: AlertButton[]) => {
    setAlertConfig({ title, message, buttons });
    setVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const hideAlert = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      setAlertConfig(null);
    });
  }, [fadeAnim]);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <Modal transparent visible={visible} animationType="none">
        <View style={styles.overlay}>
          <View style={styles.backdrop} />
          <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
            <Text style={styles.title}>{alertConfig?.title}</Text>
            {alertConfig?.message ? (
              <Text style={styles.message}>{alertConfig.message}</Text>
            ) : null}

            <View style={styles.btnRow}>
              {(!alertConfig?.buttons || alertConfig.buttons.length === 0) ? (
                <TouchableOpacity style={styles.button} onPress={hideAlert}>
                  <Text style={styles.btnText}>OK</Text>
                </TouchableOpacity>
              ) : (
                alertConfig.buttons.map((btn, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.button,
                      idx > 0 && styles.buttonBorder,
                      btn.style === 'cancel' && styles.buttonCancel,
                    ]}
                    onPress={() => {
                      hideAlert();
                      setTimeout(() => btn.onPress?.(), 100);
                    }}
                  >
                    <Text
                      style={[
                        styles.btnText,
                        btn.style === 'destructive' && { color: theme.colors.red },
                        btn.style === 'cancel' && { color: theme.colors.text40 },
                      ]}
                    >
                      {btn.text}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </Animated.View>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    backdrop: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    card: {
      width: '82%',
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.xl,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.border,
      elevation: 20,
    },
    title: {
      fontSize: theme.fontSize.lg,
      fontWeight: theme.font.bold,
      color: theme.colors.text,
      textAlign: 'center',
      marginTop: 20,
      paddingHorizontal: 16,
    },
    message: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.text40,
      textAlign: 'center',
      marginTop: 8,
      paddingHorizontal: 20,
      lineHeight: 20,
    },
    btnRow: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      marginTop: 20,
    },
    button: {
      flex: 1,
      paddingVertical: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonBorder: {
      borderLeftWidth: 1,
      borderLeftColor: theme.colors.border,
    },
    buttonCancel: {
      backgroundColor: 'rgba(255,255,255,0.02)',
    },
    btnText: {
      fontSize: theme.fontSize.base,
      fontWeight: theme.font.semibold,
      color: theme.colors.purpleLight,
    },
  });
