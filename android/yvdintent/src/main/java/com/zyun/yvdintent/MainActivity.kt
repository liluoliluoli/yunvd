package com.zyun.yvdintent

import android.os.Bundle
import android.webkit.WebView
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.annotation.OptIn
import androidx.media3.common.util.UnstableApi
import com.zyun.yvdintent.ui.ExoPlayerScreen
import com.zyun.yvdintent.viewmodel.EpisodeReq
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
        val episodeReq = try {
            if (!paramsJson.isNullOrEmpty()) {
                val json = JSONObject(paramsJson)
                EpisodeReq(
                    domain = json.optString("domain"),
                    episodeId = json.optLong("episodeId"),
                    secretKey = json.optString("secretKey"),
                    token = json.optString("token")
                )
            } else {
                EpisodeReq("", 0, "", "")
            }
        } catch (e: Exception) {
            EpisodeReq("", 0, "", "")
        }
        setContent {
            ExoPlayerScreen(
                viewModel = viewModel,
                domain = episodeReq.domain,
                episodeId = episodeReq.episodeId,
                secretKey = episodeReq.secretKey,
                token = episodeReq.token,
            )
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
