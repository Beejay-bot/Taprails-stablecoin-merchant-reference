/**
 * nfc.ts — NFC Hardware Checks
 *
 * Checks that NFC is supported and turned on before starting a payment session.
 */
import { Platform } from 'react-native';
import NfcManager from 'react-native-nfc-manager';

export const isAndroid = Platform.OS === 'android';

export const checkNfcStatus = async (): Promise<{
  supported: boolean;
  enabled: boolean;
}> => {
  if (!isAndroid) {
    return { supported: false, enabled: false };
  }

  try {
    await NfcManager.start();
    const supported = await NfcManager.isSupported();
    const enabled = supported ? await NfcManager.isEnabled() : false;
    return { supported, enabled };
  } catch {
    return { supported: false, enabled: false };
  }
};

export const openNfcSettings = async (): Promise<void> => {
  if (isAndroid) {
    try {
      await NfcManager.goToNfcSetting();
    } catch {}
  }
};
