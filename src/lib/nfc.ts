/**
 * nfc.ts — NFC Hardware Verification
 *
 * Before launching a contactless payment session, verify that:
 * 1. The device is running Android (iOS cannot act as an HCE receiver due to Apple restrictions).
 * 2. NFC hardware is present and enabled.
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
  } catch (error) {
    console.warn('[NFC] Error checking NFC status:', error);
    return { supported: false, enabled: false };
  }
};

export const openNfcSettings = async (): Promise<void> => {
  if (isAndroid) {
    try {
      await NfcManager.goToNfcSetting();
    } catch (err) {
      console.warn('[NFC] Error opening NFC settings:', err);
    }
  }
};
