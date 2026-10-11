import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TapRailsThemeProvider } from '@taprails/tap-to-pay';
import { AlertProvider } from './src/lib/AlertContext';
import { POSTerminalScreen } from './src/screens/POSTerminalScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <TapRailsThemeProvider colorOverrides={{ primary: '#7C3AED' }}>
        <AlertProvider>
          <POSTerminalScreen />
        </AlertProvider>
      </TapRailsThemeProvider>
    </SafeAreaProvider>
  );
}
