package com.zyun.yvdintent.viewmodel

import android.app.Application
import android.content.Context
import android.net.Uri
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.media3.common.MediaItem
import androidx.media3.common.MimeTypes
import androidx.media3.common.util.UnstableApi
import androidx.media3.datasource.DataSource
import androidx.media3.datasource.DataSpec
import androidx.media3.datasource.DefaultDataSource
import androidx.media3.datasource.DefaultHttpDataSource
import androidx.media3.datasource.TransferListener
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.hls.HlsMediaSource
import com.google.gson.Gson
import com.novage.p2pml.P2PMediaLoader
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.OkHttpClient
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException
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
        ExoPlayer.Builder(context).build()
    }
    private var p2pml: P2PMediaLoader? = null

    fun setupP2PML(url: String, subtitleUrl: String?) {
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
        val manifest =
            p2pml?.getManifestUrl(url)
                ?: throw IllegalStateException("P2PML is not started")
        val loggingDataSourceFactory = LoggingDataSourceFactory(context)
        var mediaSource: HlsMediaSource? = null
        if (subtitleUrl != null) {
            val subtitleUri = Uri.parse(subtitleUrl)
            val subtitleSource = MediaItem.SubtitleConfiguration.Builder(subtitleUri)
                .setMimeType(MimeTypes.APPLICATION_SUBRIP)
                .setLanguage("und")
                .build()
            mediaSource =
                HlsMediaSource
                    .Factory(loggingDataSourceFactory)
                    .createMediaSource(
                        MediaItem.fromUri(manifest).buildUpon()
                            .setSubtitleConfigurations(listOf(subtitleSource)).build()
                    )
        } else {
            mediaSource =
                HlsMediaSource
                    .Factory(loggingDataSourceFactory)
                    .createMediaSource(MediaItem.fromUri(manifest))
        }
        player.apply {
            playWhenReady = true
            setMediaSource(mediaSource)
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

    fun releaseP2P() {
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
    var episodeTitle: String,
    var url: String,
    var platform: String,
    var subtitles: List<Subtitle>
)

data class Subtitle(
    val id: Long,
    val title: String,
    val url: String,
    val language: String,
    val mimeType: String,
)

data class EpisodeReq(
    val domain: String,
    val episodeId: Long,
    val secretKey: String,
    val token: String,
    val video: Video?
)

data class Video(
    val id: Long,
    val episodes: List<Episode>?
)

object SubtitleApi {
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
        Log.i("test", "===================json:$json")
        return@withContext parseJsonToEpisode(json)
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

