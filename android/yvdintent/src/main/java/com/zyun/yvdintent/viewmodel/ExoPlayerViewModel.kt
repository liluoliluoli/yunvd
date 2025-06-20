package com.zyun.yvdintent.viewmodel

import android.app.Application
import android.content.Context
import android.net.Uri
import android.util.Log
import androidx.core.net.toUri
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import androidx.media3.common.C
import androidx.media3.common.C.SELECTION_FLAG_DEFAULT
import androidx.media3.common.MediaItem
import androidx.media3.common.MimeTypes
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.common.Tracks
import androidx.media3.common.util.UnstableApi
import androidx.media3.datasource.DataSource
import androidx.media3.datasource.DataSpec
import androidx.media3.datasource.DefaultDataSource
import androidx.media3.datasource.DefaultHttpDataSource
import androidx.media3.datasource.TransferListener
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.analytics.AnalyticsListener
import androidx.media3.exoplayer.hls.HlsMediaSource
import androidx.media3.exoplayer.source.LoadEventInfo
import androidx.media3.exoplayer.source.MediaLoadData
import androidx.media3.exoplayer.source.MergingMediaSource
import com.google.common.collect.ImmutableList
import com.google.gson.Gson
import com.novage.p2pml.P2PMediaLoader
import com.p2pengine.core.p2p.EngineExceptionListener
import com.p2pengine.core.p2p.P2pConfig
import com.p2pengine.core.p2p.P2pStatisticsListener
import com.p2pengine.core.tracking.TrackerZone
import com.p2pengine.core.utils.EngineException
import com.p2pengine.core.utils.LogLevel
import com.p2pengine.sdk.P2pEngine
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.OkHttpClient
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException
import java.net.URL
import java.security.InvalidKeyException
import java.security.NoSuchAlgorithmException
import java.time.Duration
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec


@UnstableApi
class ExoPlayerViewModel(
    application: Application,
) : AndroidViewModel(application) {
    private val context: Context
        get() = getApplication()

    val player: ExoPlayer by lazy {
        ExoPlayer.Builder(context)
            .build()
    }
    private var p2pml: P2PMediaLoader? = null

    fun setup(url: String, subtitleUrl: String?){
        if (url.contains(".m3u8") || url.contains("/m3u8")) {
//            setupP2PML(url, subtitleUrl)
            setupCdnByeP2PML(url, subtitleUrl)
        } else {
            val subtitleItem = subtitleUrl?.let { subUrl ->
                val mimeType = when {
                    subUrl.contains(".vtt") -> MimeTypes.TEXT_VTT
                    subUrl.contains(".ttml") -> MimeTypes.APPLICATION_TTML
                    subUrl.contains(".ssa", ignoreCase = true) -> MimeTypes.TEXT_SSA
                    subUrl.contains(".ass", ignoreCase = true) -> MimeTypes.TEXT_SSA
                    else -> MimeTypes.APPLICATION_SUBRIP
                }

                MediaItem.SubtitleConfiguration.Builder(subUrl.toUri())
                    .setMimeType(mimeType)
                    .setSelectionFlags(SELECTION_FLAG_DEFAULT)
                    .build()
            }
            val mediaItemBuilder = MediaItem.Builder()
                .setUri(url)
            subtitleItem?.let {
                mediaItemBuilder.setSubtitleConfigurations(listOf(it))
            }
            val mediaItem = mediaItemBuilder.build()

            player.apply {
                playWhenReady = true
                setMediaItem(mediaItem)
                prepare()
            }
        }
    }

    private fun setupCdnByeP2PML(url: String, subtitleUrl: String?) {
        val config = P2pConfig.Builder()
            .p2pEnabled(true)
            .logEnabled(true)
            .logLevel(LogLevel.DEBUG)
            .trackerZone(TrackerZone.Europe)
//            .trackerZone(TrackerZone.HongKong)
//            .trackerZone(TrackerZone.USA)
            .build()

        println("MainActivity P2pEngine init")
        P2pEngine.init(context, "hFUfE7ENg", config)

        P2pEngine.instance?.registerExceptionListener(object : EngineExceptionListener {
            override fun onTrackerException(e: EngineException) {
                println("onTrackerException ${e.message}")
            }

            override fun onSignalException(e: EngineException) {
                println("onSignalException ${e.message}")
            }

            override fun onSchedulerException(e: EngineException) {
                println("onSchedulerException ${e.message}")
            }

            override fun onOtherException(e: EngineException) {
                println("onOtherException ${e.message}")
            }

        })

        P2pEngine.instance?.addP2pStatisticsListener(object : P2pStatisticsListener {
            override fun onHttpDownloaded(value: Int) {
                println("===onHttpDownloaded $value")
            }

            override fun onP2pDownloaded(value: Int, speed: Int) {
                println("===p2p download speed $speed")
            }

            override fun onP2pUploaded(value: Int, speed: Int) {
                println("===p2p upload speed $value")
            }

            override fun onPeers(peers: List<String>) {
                println("===p2p peers size :" + peers.size)
            }

            override fun onServerConnected(connected: Boolean) {
                println("===p2p peer id :" + P2pEngine.instance?.peerId + String.format("Connected: %s", if (connected) "Yes" else "No"))
            }
        })

        val manifest = P2pEngine.instance?.parseStreamUrl(url)
        val subtitleItem = subtitleUrl?.let { subUrl ->
            val mimeType = when {
                subUrl.contains(".vtt") -> MimeTypes.TEXT_VTT
                subUrl.contains(".ttml") -> MimeTypes.APPLICATION_TTML
                subUrl.contains(".ssa", ignoreCase = true) -> MimeTypes.TEXT_SSA
                subUrl.contains(".ass", ignoreCase = true) -> MimeTypes.TEXT_SSA
                else -> MimeTypes.APPLICATION_SUBRIP
            }

            MediaItem.SubtitleConfiguration.Builder(subUrl.toUri())
                .setMimeType(mimeType)
                .setSelectionFlags(SELECTION_FLAG_DEFAULT)
                .build()
        }
        val mediaItemBuilder = MediaItem.Builder()
            .setUri(manifest)
            .setMimeType(MimeTypes.APPLICATION_M3U8)

        subtitleItem?.let {
            mediaItemBuilder.setSubtitleConfigurations(listOf(it))
        }
        val mediaItem = mediaItemBuilder.build()

        player.apply {
            playWhenReady = true
            setMediaItem(mediaItem)
            prepare()
        }
    }

    private fun setupP2PML(url: String, subtitleUrl: String?) {
        releaseP2P()
        p2pml =
            P2PMediaLoader(
                onP2PReadyCallback = { initializePlayback(url, subtitleUrl) },
                onP2PReadyErrorCallback = { onReadyError(it) },
                coreConfigJson = "{\"swarmId\":\"TEST_KOTLIN\"}",
                serverPort = 8082,
            )

        p2pml!!.start(context, player)
    }

    private fun initializePlayback(url: String, subtitleUrl: String?) {
        val manifest = p2pml?.getManifestUrl(url) ?: throw IllegalStateException("P2PML is not started")

        val subtitleItem = subtitleUrl?.let { subUrl ->
            val mimeType = when {
                subUrl.contains(".vtt") -> MimeTypes.TEXT_VTT
                subUrl.contains(".ttml") -> MimeTypes.APPLICATION_TTML
                subUrl.contains(".ssa", ignoreCase = true) -> MimeTypes.TEXT_SSA
                subUrl.contains(".ass", ignoreCase = true) -> MimeTypes.TEXT_SSA
                else -> MimeTypes.APPLICATION_SUBRIP
            }

            MediaItem.SubtitleConfiguration.Builder(subUrl.toUri())
                .setMimeType(mimeType)
                .setSelectionFlags(SELECTION_FLAG_DEFAULT)
                .build()
        }
        val mediaItemBuilder = MediaItem.Builder()
            .setUri(manifest)
            .setMimeType(MimeTypes.APPLICATION_M3U8)

        subtitleItem?.let {
            mediaItemBuilder.setSubtitleConfigurations(listOf(it))
        }
        val mediaItem = mediaItemBuilder.build()

        player.apply {
            playWhenReady = true
            setMediaItem(mediaItem)
            prepare()
        }
    }

    private fun onReadyError(message: String) {
        // Handle error
        Log.e("ExoPlayerViewModel", message)
    }

    fun releasePlayer() {
        player.release()
        p2pml?.stop()
    }

    private fun releaseP2P() {
        p2pml?.stop()
    }

    fun updateP2PConfig(isP2PDisabled: Boolean) {
        val configJson = "{\"isP2PDisabled\": $isP2PDisabled}"
        p2pml?.applyDynamicConfig(configJson)
    }
}

@UnstableApi
class LoggingDataSourceFactory(
    context: Context,
) : DataSource.Factory {
    private val httpDataSourceFactory =
        DefaultHttpDataSource
            .Factory()
            // Set your connection parameters here
            .setConnectTimeoutMs(30000)
            // Set your read timeout here
            .setReadTimeoutMs(30000)

    private val baseDataSourceFactory = DefaultDataSource.Factory(context, httpDataSourceFactory)

    override fun createDataSource(): DataSource =
        LoggingDataSource(baseDataSourceFactory.createDataSource())
}

@UnstableApi
class LoggingDataSource(
    private val wrappedDataSource: DataSource,
) : DataSource {
    override fun open(dataSpec: DataSpec): Long {
        Log.d("HLSSegmentLogger", "Requesting: ${dataSpec.uri}")
        return try {
            wrappedDataSource.open(dataSpec)
        } catch (e: Exception) {
            Log.e("HLSSegmentLogger", "Error opening data source: ${e.message}", e)
            throw e
        }
    }

    override fun read(
        buffer: ByteArray,
        offset: Int,
        length: Int,
    ): Int =
        try {
            wrappedDataSource.read(buffer, offset, length)
        } catch (e: Exception) {
            Log.e("HLSSegmentLogger", "Error reading data source: ${e.message}", e)
            throw e
        }

    override fun addTransferListener(transferListener: TransferListener) {
        wrappedDataSource.addTransferListener(transferListener)
    }

    override fun getUri(): Uri? = wrappedDataSource.uri

    override fun close() {
        try {
            wrappedDataSource.close()
        } catch (e: Exception) {
            Log.e("HLSSegmentLogger", "Error closing data source: ${e.message}", e)
        }
    }
}


val okHttpClient = OkHttpClient.Builder()
    .connectTimeout(Duration.ofSeconds(10))
    .readTimeout(Duration.ofSeconds(10))
    .writeTimeout(Duration.ofSeconds(10))
    .retryOnConnectionFailure(true)
    .build()

data class Episode(
    val id: Long,
    val videoId: Long,
    val episode: Long,
    val episodeTitle: String,
    val url: String,
    val platform: String,
    val subtitles: List<Subtitle>,
    val audios: List<Audio>
)

data class Subtitle(
    val id: Long,
    val title: String,
    val url: String,
    val language: String,
    val mimeType: String,
)

data class Audio(
    val id: Long,
    val title: String,
    val url: String,
    val language: String,
    val mimeType: String,
)

data class EpisodeReq(
    val domain: String,
    val episodeId: Long,
    val lastPlayedPosition: Long,
    val secretKey: String,
    val token: String,
    val video: Video?
)

data class ReportPlayStatusBody(
    val updatePlayedStatusList: List<ReportPlayStatus>,
)

data class ReportPlayStatus(
    val videoId: Long,
    val episodeId: Long,
    val position: Long,
    val playTimestamp: Long,
)

data class Video(
    val id: Long,
    val episodes: List<Episode>?
)

object RemoteApi {
    suspend fun getEpisode(
        domain: String,
        token: String,
        secretKey: String,
        episodeId: Long,
    ): Episode = withContext(Dispatchers.IO) {
        val requestBody = """
            {
                "id": $episodeId
            }
        """.trimIndent()
        var now = System.currentTimeMillis()
        val request = okhttp3.Request.Builder()
            .url("${domain}/api/episode/get")
            .addHeader("Authorization", token)
            .addHeader("Signature", signature("/api/episode/get", now, secretKey))
            .addHeader("Timestamp", now.toString())
            .addHeader("Content-Type", "application/json")
            .post(
                requestBody
                    .toRequestBody("application/json".toMediaTypeOrNull())
            )
            .build()
        val response = okHttpClient.newCall(request).execute()
        if (!response.isSuccessful) {
            throw IOException("Unexpected code $response")
        }
        val json = response.body?.use { it.string() }
            ?: throw IOException("Response body is null")
        return@withContext parseJsonToEpisode(json)
    }

    suspend fun reportPlayProgress(
        domain: String,
        token: String,
        secretKey: String,
        videoId: Long,
        episodeId: Long,
        position: Long,
        playTimestamp: Long
    ) = withContext(Dispatchers.IO) {
        val playRecords = ReportPlayStatusBody(
            updatePlayedStatusList = listOf(
                ReportPlayStatus(
                    videoId = videoId,
                    episodeId = episodeId,
                    position = position,
                    playTimestamp = playTimestamp
                )
            )
        )
        var now = System.currentTimeMillis()
        val request = okhttp3.Request.Builder()
            .url("${domain}/api/user/updatePlayedStatus")
            .addHeader("Authorization", token)
            .addHeader("Signature", signature("/api/user/updatePlayedStatus", now, secretKey))
            .addHeader("Timestamp", now.toString())
            .addHeader("Content-Type", "application/json")
            .post(
                Gson().toJson(playRecords)
                    .toRequestBody("application/json".toMediaTypeOrNull())
            )
            .build()
        val response = okHttpClient.newCall(request).execute()
        if (!response.isSuccessful) {
            throw IOException("Unexpected code $response")
        }
        val json = response.body?.use { it.string() }
            ?: throw IOException("Response body is null")
    }

    fun signature(path: String, timestamp: Long, secretKey: String): String {
        try {
            val algorithm = "HmacSHA256"
            val secretKeySpec = SecretKeySpec(secretKey.toByteArray(), algorithm)
            val mac = Mac.getInstance(algorithm)
            mac.init(secretKeySpec)
            var source = "$path$timestamp"
            val hashBytes = mac.doFinal(source.toByteArray())
            return hashBytes.joinToString("") { "%02x".format(it) }
        } catch (e: NoSuchAlgorithmException) {
            throw RuntimeException("HmacSHA256 not supported", e)
        } catch (e: InvalidKeyException) {
            throw RuntimeException("Invalid key", e)
        }
    }
}

fun parseJsonToEpisode(json: String): Episode {
    val gson = Gson()
    return gson.fromJson(json, Episode::class.java)
}

fun parseJsonToEpisodeReq(json: String): EpisodeReq {
    val gson = Gson()
    return gson.fromJson(json, EpisodeReq::class.java)
}

