import { NativeModules } from 'react-native';

/**
 * Thin wrapper over the native AudioRoute module (Android only, for now).
 *
 * If the native module is absent (iOS, tests, or not yet linked) every call is
 * a safe no-op — audio routing must never crash the call.
 */
type AudioRouteNative = {
  setSpeakerOn(enable: boolean): void;
};

const native: AudioRouteNative | undefined = NativeModules.AudioRoute;

export function setSpeakerOn(enable: boolean): void {
  try {
    native?.setSpeakerOn(enable);
  } catch {
    // best-effort
  }
}
