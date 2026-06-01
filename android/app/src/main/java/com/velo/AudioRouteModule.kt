package com.velo

import android.content.Context
import android.media.AudioManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * Minimal audio-route module: forces call audio to the loudspeaker.
 *
 * Deliberately tiny — it only touches AudioManager's mode + speakerphone flag.
 * No Bluetooth/SCO enumeration (which needs BLUETOOTH_CONNECT and crashed
 * InCallManager on Android 12+). Everything is wrapped so a routing failure can
 * never take down the call.
 */
class AudioRouteModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName() = "AudioRoute"

  @ReactMethod
  fun setSpeakerOn(enable: Boolean) {
    try {
      val am =
        reactApplicationContext.getSystemService(Context.AUDIO_SERVICE)
          as AudioManager
      if (enable) {
        am.mode = AudioManager.MODE_IN_COMMUNICATION
        @Suppress("DEPRECATION")
        am.isSpeakerphoneOn = true
      } else {
        @Suppress("DEPRECATION")
        am.isSpeakerphoneOn = false
        am.mode = AudioManager.MODE_NORMAL
      }
    } catch (e: Exception) {
      // Best-effort: never crash the call over audio routing.
    }
  }
}
