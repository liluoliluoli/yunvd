package com.zyun.yvdintent

import android.os.Bundle
import android.webkit.WebView
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.annotation.OptIn
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.media3.common.util.UnstableApi
import com.zyun.yvdintent.ui.ExoPlayerScreen
import com.zyun.yvdintent.viewmodel.ExoPlayerViewModel
import org.json.JSONObject

@UnstableApi
class MainActivity : ComponentActivity() {
    private val viewModel: ExoPlayerViewModel by lazy {
        ExoPlayerViewModel(application)
    }

    @OptIn(UnstableApi::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Enable debugging of WebViews
        WebView.setWebContentsDebuggingEnabled(true)
        val paramsJson = intent?.getStringExtra("params")
        val (url, title) = try {
            if (!paramsJson.isNullOrEmpty()) {
                val json = JSONObject(paramsJson)
                Pair(
                    json.getString("url") ?: "",
                    json.optString("title", "")
                )
            } else {
                Pair("", "")
            }
        } catch (e: Exception) {
            Pair("", "")
        }

        viewModel.setupP2PML(url)
        setContent {
            ExoPlayerScreen(player = viewModel.player, title = title)
        }
    }

    override fun onStop() {
        super.onStop()
        viewModel.updateP2PConfig(isP2PDisabled = true)
    }

    override fun onRestart() {
        super.onRestart()
        viewModel.updateP2PConfig(isP2PDisabled = false)
    }

    override fun onDestroy() {
        super.onDestroy()
        viewModel.releasePlayer()
    }
}
