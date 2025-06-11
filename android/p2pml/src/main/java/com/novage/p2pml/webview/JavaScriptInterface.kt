package com.novage.p2pml.webview

import android.util.Base64
import android.util.Log
import android.webkit.JavascriptInterface
import com.novage.p2pml.ChunkDownloadedDetails
import com.novage.p2pml.ChunkUploadedDetails
import com.novage.p2pml.CoreEventMap
import com.novage.p2pml.logger.Logger
import com.novage.p2pml.utils.EventEmitter
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.serialization.json.Json
import java.io.ByteArrayOutputStream
import java.util.concurrent.ConcurrentHashMap

internal class JavaScriptInterface(
    private val onFullyLoadedCallback: () -> Unit,
    private val eventEmitter: EventEmitter,
    private val coroutineScope: CoroutineScope,
    private val segmentResponseCallbacks : MutableMap<Int, CompletableDeferred<ByteArray>>
) {
    private val mutex = Mutex()
    private val pendingData = ConcurrentHashMap<Int, ByteArrayOutputStream>()

    @JavascriptInterface
    fun onWebViewLoaded() {
        onFullyLoadedCallback()
    }

    @JavascriptInterface
    fun onPeerConnect(jsonParams: String) = handleEvent(CoreEventMap.OnPeerConnect, jsonParams)

    @JavascriptInterface
    fun onPeerClose(jsonParams: String) = handleEvent(CoreEventMap.OnPeerClose, jsonParams)

    @JavascriptInterface
    fun onPeerError(jsonParams: String) = handleEvent(CoreEventMap.OnPeerError, jsonParams)

    @JavascriptInterface
    fun onSegmentStart(jsonParams: String) = handleEvent(CoreEventMap.OnSegmentStart, jsonParams)

    @JavascriptInterface
    fun onSegmentAbort(jsonParams: String) = handleEvent(CoreEventMap.OnSegmentAbort, jsonParams)

    @JavascriptInterface
    fun onSegmentError(jsonParams: String) = handleEvent(CoreEventMap.OnSegmentError, jsonParams)

    @JavascriptInterface
    fun onSegmentLoaded(jsonParams: String) = handleEvent(CoreEventMap.OnSegmentLoaded, jsonParams)

    @JavascriptInterface
    fun onTrackerError(jsonParams: String) = handleEvent(CoreEventMap.OnTrackerError, jsonParams)

    @JavascriptInterface
    fun onTrackerWarning(jsonParams: String) = handleEvent(CoreEventMap.OnTrackerWarning, jsonParams)

    @JavascriptInterface
    fun onChunkUploaded(
        bytesLength: Int,
        peerId: String,
    ) {
        if (!eventEmitter.hasListeners(CoreEventMap.OnChunkUploaded)) return

        val details = ChunkUploadedDetails(bytesLength, peerId)

        eventEmitter.emit(CoreEventMap.OnChunkUploaded, details)
    }

    @JavascriptInterface
    fun onChunkDownloaded(
        bytesLength: Int,
        downloadSource: String,
        peerId: String,
    ) {
        if (!eventEmitter.hasListeners(CoreEventMap.OnChunkDownloaded)) return

        val peerIdentifier = if (peerId == "undefined") null else peerId

        val details =
            ChunkDownloadedDetails(
                bytesLength,
                downloadSource,
                peerId = peerIdentifier,
            )

        eventEmitter.emit(CoreEventMap.OnChunkDownloaded, details)
    }

    @JavascriptInterface
    fun onTransferStart(requestId: Int, totalChunks: Int) {
        pendingData[requestId] = if (totalChunks > 10) {
            ByteArrayOutputStream(64 * 1024 * totalChunks)
        } else {
            ByteArrayOutputStream()
        }
    }

    @JavascriptInterface
    fun onReceiveChunk(requestId: Int, chunkIndex: Int, base64Chunk: String) {
        try {
            val byteArray = Base64.decode(base64Chunk, Base64.DEFAULT)
            pendingData[requestId]?.write(byteArray)
        } catch (e: Exception) {
            Log.e("JavaScriptInterface", "Chunk process error", e)
        }
    }

    @JavascriptInterface
    fun onTransferComplete(requestId: Int) {
        val outputStream = pendingData[requestId] ?: return
        try {
            val completeData = outputStream.toByteArray()
            handleSegmentIdBytes(requestId, completeData)
        } finally {
            pendingData.remove(requestId)
            outputStream.close()
        }
    }

    private inline fun <reified T> handleEvent(
        event: CoreEventMap<T>,
        jsonParams: String,
    ) {
        if (!eventEmitter.hasListeners(event)) return

        try {
            val parsedParams = Json.decodeFromString<T>(jsonParams)
            eventEmitter.emit(event, parsedParams)
        } catch (e: Exception) {
            Logger.e("JavaScriptInterface", "Failed to parse event parameters", e)
        }
    }

    private fun handleSegmentIdBytes(requestId:Int, arrayBuffer: ByteArray) {
        coroutineScope.launch {
            val deferred =
                getSegmentResponseCallback(requestId)
                    ?: throw IllegalStateException("No deferred found for request ID: $requestId")

            deferred.complete(arrayBuffer)
            removeSegmentResponseCallback(requestId)

        }
    }

    private suspend fun getSegmentResponseCallback(requestId: Int): CompletableDeferred<ByteArray>? =
        mutex.withLock {
            segmentResponseCallbacks[requestId]
        }

    private suspend fun removeSegmentResponseCallback(requestId: Int) {
        mutex.withLock {
            segmentResponseCallbacks.remove(requestId)
        }
    }
}
