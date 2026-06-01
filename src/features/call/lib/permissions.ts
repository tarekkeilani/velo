import { PermissionsAndroid, Platform } from 'react-native';

/**
 * Ensures camera + microphone access before capturing media.
 *
 * iOS prompts automatically (via the Info.plist usage strings) the first time
 * getUserMedia runs, so this is a no-op there. Android 6+ requires an explicit
 * runtime request — without it, getUserMedia fails silently.
 */
export async function ensureMediaPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  const result = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.CAMERA,
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
  ]);

  return (
    result[PermissionsAndroid.PERMISSIONS.CAMERA] ===
      PermissionsAndroid.RESULTS.GRANTED &&
    result[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] ===
      PermissionsAndroid.RESULTS.GRANTED
  );
}
