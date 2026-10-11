import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TapRailsThemeProvider } from '@taprails/tap-to-pay';
import { POSTerminalScreen } from './src/screens/POSTerminalScreen';
import { ThemeProvider, useTheme } from './src/lib/ThemeProvider';
import { AlertProvider } from './src/lib/AlertContext';

const AppContent = () => {
  const { theme } = useTheme();

  return (
    <TapRailsThemeProvider
      colorOverrides={{
        primary: theme.colors.purple,
        success: theme.colors.green,
        error: theme.colors.red,
        background: theme.colors.background,
        backgroundSecondary: theme.colors.surface,
        backgroundTertiary: theme.colors.surfaceElevated,
        text: theme.colors.text,
        textSecondary: theme.colors.text70,
        textTertiary: theme.colors.text40,
        border: theme.colors.border,
      }}
    >
      <POSTerminalScreen />
    </TapRailsThemeProvider>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AlertProvider>
          <AppContent />
        </AlertProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
