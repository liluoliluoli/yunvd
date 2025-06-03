package com.novage.p2pml.webview

import android.util.Base64
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

internal class JavaScriptInterface(
    private val onFullyLoadedCallback: () -> Unit,
    private val eventEmitter: EventEmitter,
    private val coroutineScope: CoroutineScope,
    private val segmentResponseCallbacks : MutableMap<Int, CompletableDeferred<ByteArray>>
) {
    private val mutex = Mutex()

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
    fun onLoadSegmentBytes(
        requestId: Int,
        base64Data: String,
    ) {
        val byteArray = Base64.decode(base64Data, Base64.DEFAULT)
        handleSegmentIdBytes(requestId, byteArray)
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
