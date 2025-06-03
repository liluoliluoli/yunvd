package com.zyun.yvdintent

import android.os.Bundle
import android.webkit.WebView
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.annotation.OptIn
import androidx.media3.common.util.UnstableApi
import com.google.gson.Gson
import com.zyun.yvdintent.ui.ExoPlayerScreen
import com.zyun.yvdintent.viewmodel.EpisodeReq
import com.zyun.yvdintent.viewmodel.ExoPlayerViewModel

@UnstableApi
class MainActivity : ComponentActivity() {
    private var backPressedTime: Long = 0

    private val viewModel: ExoPlayerViewModel by lazy {
        ExoPlayerViewModel(application)
    }

    @OptIn(UnstableApi::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WebView.setWebContentsDebuggingEnabled(true)
        val paramsJson = intent?.getStringExtra("params")
        val episodeReq = try {
            if (!paramsJson.isNullOrEmpty()) {
                Gson().fromJson(paramsJson, EpisodeReq::class.java)
            } else {
                EpisodeReq("", 0, 0, "", "", null)
            }
        } catch (e: Exception) {
            EpisodeReq("", 0, 0, "", "", null)
        }
        setContent {
            ExoPlayerScreen(
                viewModel = viewModel,
                domain = episodeReq.domain,
                initialEpisodeId = episodeReq.episodeId,
                initialLastPlayedPosition = episodeReq.lastPlayedPosition,
                secretKey = episodeReq.secretKey,
                token = episodeReq.token,
                episodes = episodeReq.video?.episodes
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
        viewModel.releasePlayer()
        super.onDestroy()
        YvdIntent.sendEventToRN("onPlayerClosed", System.currentTimeMillis().toString())
    }

    override fun onBackPressed() {
        if (System.currentTimeMillis() - backPressedTime < 2000) {
            super.onBackPressed()
        } else {
            backPressedTime = System.currentTimeMillis()
            Toast.makeText(this, "再按一次退出播放", Toast.LENGTH_SHORT).show()
        }
    }
}
