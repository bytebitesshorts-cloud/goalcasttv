package com.goalcast.app

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class PipModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String = "PipModule"

    @ReactMethod
    fun setEnabled(enabled: Boolean) {
        MainActivity.isPipEnabled = enabled
    }

    @ReactMethod
    fun enterPipMode() {
        val activity = currentActivity
        if (activity != null && android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            try {
                val params = android.app.PictureInPictureParams.Builder().build()
                activity.enterPictureInPictureMode(params)
            } catch (e: Exception) {
                // Ignore
            }
        }
    }
}
