package com.zyun.yvdintent.ui

import android.content.Context
import android.util.Log
import android.view.ViewGroup
import android.widget.Toast
import androidx.annotation.OptIn
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.focusable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.key.Key
import androidx.compose.ui.input.key.KeyEventType
import androidx.compose.ui.input.key.key
import androidx.compose.ui.input.key.onKeyEvent
import androidx.compose.ui.input.key.type
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.AspectRatioFrameLayout
import androidx.media3.ui.PlayerView
import androidx.tv.material3.ButtonDefaults
import androidx.tv.material3.Icon
import androidx.tv.material3.IconButton
import androidx.tv.material3.LocalTextStyle
import androidx.tv.material3.Text
import com.zyun.yvdintent.R
import com.zyun.yvdintent.viewmodel.Audio
import com.zyun.yvdintent.viewmodel.Episode
import com.zyun.yvdintent.viewmodel.ExoPlayerViewModel
import com.zyun.yvdintent.viewmodel.RemoteApi
import com.zyun.yvdintent.viewmodel.Subtitle
import kotlinx.coroutines.delay

@UnstableApi
@Composable
fun ExoPlayerScreen(
    viewModel: ExoPlayerViewModel,
    domain: String,
    initialEpisodeId: Long,
    initialLastPlayedPosition: Long,
    secretKey: String,
    token: String,
    episodes: List<Episode>?,
) {
    val context = LocalContext.current
    var progress by remember { mutableStateOf(0F) }
    var maxProgress by remember { mutableStateOf(1F) }
    var formattedRemainingTime by remember { mutableStateOf("00:00") }
    var isPlayerReady by remember { mutableStateOf(false) }
    var showController by remember { mutableStateOf(false) }
    val sliderFocusRequester = remember { FocusRequester() }
    var lastInteractionTime by remember { mutableLongStateOf(System.currentTimeMillis()) }
    var episode by remember { mutableStateOf<Episode?>(null) }
    var isLoading by remember { mutableStateOf(false) }
    var episodeId by remember { mutableLongStateOf(initialEpisodeId) }
    var showSubtitleDialog by remember { mutableStateOf(false) }
    var showEpisodeDialog by remember { mutableStateOf(false) }
    var showAudioDialog by remember { mutableStateOf(false) }
    var lastReportTime by remember { mutableLongStateOf(0L) }
    var lastPlayedPosition by remember { mutableLongStateOf(initialLastPlayedPosition) }

    DisposableEffect(Unit) {
        val listener = object : Player.Listener {
            override fun onPlaybackStateChanged(playbackState: Int) {
                if (playbackState == Player.STATE_READY) {
                    isPlayerReady = true
                    maxProgress = viewModel.player.duration.toFloat()
                    formattedRemainingTime =
                        formatRemainingTime(
                            viewModel.player.currentPosition,
                            viewModel.player.duration
                        )
                    if (lastPlayedPosition > 0) {
                        val formatTime = formatContinueTime(lastPlayedPosition * 1000)
                        Toast.makeText(context, "续播:$formatTime", Toast.LENGTH_SHORT).show()
                        viewModel.player.seekTo(lastPlayedPosition * 1000)
                        lastPlayedPosition = 0
                    }
                }
                if (playbackState == Player.STATE_BUFFERING) {
                    isPlayerReady = false
                }
                if (playbackState == Player.STATE_ENDED) {
                    episodes?.let {
                        val currentIndex = it.indexOfFirst { it.id == episodeId }
                        if (currentIndex >= 0 && currentIndex + 1 < it.size) {
                            episodeId = it[currentIndex + 1].id
                            val episodeTitle = it[currentIndex + 1].episodeTitle
                            Toast.makeText(
                                context,
                                "自动播放下一集：$episodeTitle",
                                Toast.LENGTH_SHORT
                            ).show()
                        }
                    }
                }
            }

            override fun onPositionDiscontinuity(
                oldPosition: Player.PositionInfo,
                newPosition: Player.PositionInfo,
                reason: Int
            ) {
                progress = viewModel.player.currentPosition.toFloat()
                if (isPlayerReady) {
                    formattedRemainingTime =
                        formatRemainingTime(
                            viewModel.player.currentPosition,
                            viewModel.player.duration
                        )
                }
            }
        }
        viewModel.player.addListener(listener)

        onDispose {
            viewModel.player.removeListener(listener)
            viewModel.player.release()
        }
    }

    LaunchedEffect(Unit) {
        val reportInterval = 5000L
        while (true) {
            if (viewModel.player.isPlaying && episode != null) {
                val currentPosition = viewModel.player.currentPosition
                if (System.currentTimeMillis() - lastReportTime >= reportInterval) {
                    lastReportTime = System.currentTimeMillis()
                    try {
                        RemoteApi.reportPlayProgress(
                            domain = domain,
                            token = token,
                            secretKey = secretKey,
                            videoId = episode?.videoId!!,
                            episodeId = episodeId,
                            position = currentPosition / 1000,
                            playTimestamp = lastReportTime / 1000,
                        )
                    } catch (e: Exception) {
                        Log.e("ExoPlayerScreen", "上报播放进度失败: ${e.message}")
                    }
                }
            }
            delay(reportInterval)
        }
    }

    LaunchedEffect(Unit) {
        while (true) {
            if (viewModel.player.isPlaying && viewModel.player.duration > 0) {
                progress = viewModel.player.currentPosition.toFloat()
                formattedRemainingTime =
                    formatRemainingTime(viewModel.player.currentPosition, viewModel.player.duration)
            }
            delay(1000L)
        }
    }

    LaunchedEffect(showController, showSubtitleDialog, showEpisodeDialog, showAudioDialog) {
        if (showController) {
            delay(100)
            sliderFocusRequester.requestFocus()
            while (showController && System.currentTimeMillis() - lastInteractionTime < 5000) {
                delay(5000L)
            }
            if (!showSubtitleDialog && !showEpisodeDialog && !showAudioDialog) {
                showController = false
            }
        }
    }

    LaunchedEffect(episodeId) {
        try {
            isLoading = true
            episode = RemoteApi.getEpisode(
                domain = domain,
                token = token,
                secretKey = secretKey,
                episodeId = episodeId,
            )
            viewModel.releaseP2P()
            viewModel.setupP2PML(episode!!.url, null)
        } catch (e: Exception) {
            Toast.makeText(context, "请求播放地址失败：$e", Toast.LENGTH_SHORT).show()
        } finally {
            isLoading = false
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .focusable()
            .onKeyEvent { event ->
                if (event.type == KeyEventType.KeyDown) {
                    when (event.key) {
                        Key.DirectionCenter -> {
                            showController = true
                            lastInteractionTime = System.currentTimeMillis()
                            true
                        }

                        Key.DirectionDown, Key.DirectionLeft, Key.DirectionRight -> {
                            lastInteractionTime = System.currentTimeMillis()
                            if (showController) {
                                showController = true
                                false //传给CustomPlayerController处理
                            } else {
                                showController = true
                                true
                            }
                        }

                        else -> {
                            lastInteractionTime = System.currentTimeMillis()
                            false
                        }
                    }
                } else {
                    false
                }
            }
    ) {
        AndroidView(
            factory = { context ->
                PlayerView(context).apply {
                    this.player = viewModel.player
                    useController = false
                    descendantFocusability = ViewGroup.FOCUS_BLOCK_DESCENDANTS
                    this.resizeMode = AspectRatioFrameLayout.RESIZE_MODE_ZOOM
                }
            },
        )

        Box(modifier = Modifier.fillMaxSize()) {
            AnimatedVisibility(
                visible = showController,
                enter = fadeIn(),
                exit = fadeOut()
            ) {
                CustomPlayerController(
                    player = viewModel.player,
                    progress = progress,
                    maxProgress = maxProgress,
                    formattedRemainingTime = formattedRemainingTime,
                    episode = episode,
                    episodes = episodes,
                    sliderFocusRequester = sliderFocusRequester,
                    context = context,
                    viewModel = viewModel,
                    onEpisodeChanged = { newEpisodeId ->
                        episodeId = newEpisodeId
                    },
                    onShowController = { newShowController ->
                        showController = newShowController
                    },
                    onShowSubtitleDialog = { newShowSubtitleDialog ->
                        showSubtitleDialog = newShowSubtitleDialog
                        lastInteractionTime = System.currentTimeMillis()
                    },
                    onShowEpisodeDialog = { newShowEpisodeDialog ->
                        showEpisodeDialog = newShowEpisodeDialog
                        lastInteractionTime = System.currentTimeMillis()
                    },
                    onShowAudioDialog = { newShowAudioDialog ->
                        showAudioDialog = newShowAudioDialog
                        lastInteractionTime = System.currentTimeMillis()
                    },
                )
            }

            if (!isPlayerReady || isLoading) {
                Box(
                    modifier = Modifier
                        .align(Alignment.Center)
                        .focusable(false)
                ) {
                    CircularProgressIndicator(
                        color = Color.Blue,
                        modifier = Modifier.size(20.dp),
                    )
                }
            }
        }
    }
}


@OptIn(UnstableApi::class)
@Composable
fun CustomPlayerController(
    player: ExoPlayer,
    progress: Float,
    maxProgress: Float,
    formattedRemainingTime: String,
    episode: Episode?,
    episodes: List<Episode>?,
    sliderFocusRequester: FocusRequester,
    context: Context = LocalContext.current,
    viewModel: ExoPlayerViewModel,
    onEpisodeChanged: (Long) -> Unit,
    onShowController: (Boolean) -> Unit,
    onShowSubtitleDialog: (Boolean) -> Unit,
    onShowEpisodeDialog: (Boolean) -> Unit,
    onShowAudioDialog: (Boolean) -> Unit
) {
    var isPlaying by remember { mutableStateOf(player.isPlaying) }
    var isFocusedSubtitle by remember { mutableStateOf(false) }
    var isFocusedEpisode by remember { mutableStateOf(false) }
    var isFocusedSpeed by remember { mutableStateOf(false) }
    var isFocusedAudio by remember { mutableStateOf(false) }
    var showSubtitleDialog by remember { mutableStateOf(false) }
    var selectedSubtitle by remember { mutableStateOf<Subtitle?>(null) }
    var showEpisodeDialog by remember { mutableStateOf(false) }
    var selectedEpisodeId by remember { mutableLongStateOf(episode?.id!!) }
    var showAudioDialog by remember { mutableStateOf(false) }
    var selectedAudio by remember { mutableStateOf<Audio?>(null) }

    fun setSubtitle(episodeUrl: String, subtitle: Subtitle) {
        selectedSubtitle = subtitle
        setSubtitleForPlayer(player, episodeUrl, subtitle.url, context, viewModel)
        showSubtitleDialog = false
        onShowSubtitleDialog(false)
    }

    fun setEpisode(episodeId: Long) {
        selectedEpisodeId = episodeId
        onEpisodeChanged(episodeId)
        showEpisodeDialog = false
        onShowEpisodeDialog(false)
    }

    fun setAudio(episodeUrl: String, audio: Audio) {
        selectedAudio = audio
        setSubtitleForPlayer(player, episodeUrl, audio.url, context, viewModel)
        showAudioDialog = false
        onShowAudioDialog(false)
    }

    if (showSubtitleDialog) {
        Dialog(
            onDismissRequest = {
                showSubtitleDialog = false
                onShowSubtitleDialog(false)
            },
            properties = DialogProperties(
                usePlatformDefaultWidth = false,
            )
        ) {
            Surface(
                modifier = Modifier
                    .width(350.dp)
                    .height(300.dp)
                    .padding(1.dp)
                    .clip(MaterialTheme.shapes.small)
                    .border(
                        width = 1.dp,
                        color = Color.Gray.copy(alpha = 0.2f),
                        shape = MaterialTheme.shapes.medium
                    ),
                color = Color(0xFFB0E0E6).copy(alpha = 0.8f)
            ) {
                Column(
                    modifier = Modifier.padding(4.dp)
                ) {
                    LazyColumn {
                        items(episode?.subtitles?.size ?: 0) { index ->
                            val isSelected =
                                episode?.subtitles?.getOrNull(index) == selectedSubtitle
                            val backgroundColor =
                                if (isSelected) MaterialTheme.colorScheme.primaryContainer else Color.Transparent
                            var isFocused by remember { mutableStateOf(false) }
                            val itemFocusRequester = remember { FocusRequester() }
                            if (isSelected) {
                                LaunchedEffect(Unit) {
                                    itemFocusRequester.requestFocus()
                                }
                            }

                            Column {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(32.dp)
                                        .background(backgroundColor)
                                        .clickable {
                                            setSubtitle(
                                                episode?.url!!,
                                                episode?.subtitles?.getOrNull(index)!!
                                            )
                                        }
                                        .focusRequester(itemFocusRequester)
                                        .focusable()
                                        .onFocusChanged { focusState ->
                                            isFocused = focusState.isFocused
                                        },
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        painter = painterResource(id = R.drawable.ic_comment),
                                        contentDescription = "Subtitle",
                                        tint = when {
                                            isSelected -> Color.White
                                            isFocused -> Color.White
                                            else -> Color.White.copy(alpha = 0.8f)
                                        },
                                        modifier = Modifier
                                            .size(24.dp)
                                            .then(
                                                if (isSelected) {
                                                    Modifier.background(
                                                        color = Color.Black.copy(alpha = 0.8f),
                                                        shape = androidx.compose.foundation.shape.CircleShape
                                                    )
                                                } else {
                                                    Modifier
                                                }
                                            )
                                    )
                                    episode?.subtitles?.getOrNull(index)?.let {
                                        Text(
                                            "  " + it.title,
                                            color = when {
                                                isFocused -> Color.Red
                                                else -> Color.White
                                            },
                                            style = when {
                                                isFocused -> LocalTextStyle.current.copy(
                                                    fontWeight = FontWeight.Bold
                                                )

                                                else -> LocalTextStyle.current
                                            }
                                        )
                                    }
                                }
                                HorizontalDivider(
                                    thickness = 1.dp,
                                    color = Color.White.copy(alpha = 0.2f)
                                )
                            }
                        }
                    }
                }
            }
        }
    }

    if (showAudioDialog) {
        Dialog(
            onDismissRequest = {
                showAudioDialog = false
                onShowAudioDialog(false)
            },
            properties = DialogProperties(
                usePlatformDefaultWidth = false,
            )
        ) {
            Surface(
                modifier = Modifier
                    .width(350.dp)
                    .height(300.dp)
                    .padding(1.dp)
                    .clip(MaterialTheme.shapes.small)
                    .border(
                        width = 1.dp,
                        color = Color.Gray.copy(alpha = 0.2f),
                        shape = MaterialTheme.shapes.medium
                    ),
                color = Color(0xFFB0E0E6).copy(alpha = 0.8f)
            ) {
                Column(
                    modifier = Modifier.padding(4.dp)
                ) {
                    LazyColumn {
                        items(episode?.audios?.size ?: 0) { index ->
                            val isSelected =
                                episode?.audios?.getOrNull(index) == selectedAudio
                            val backgroundColor =
                                if (isSelected) MaterialTheme.colorScheme.primaryContainer else Color.Transparent
                            var isFocused by remember { mutableStateOf(false) }
                            val itemFocusRequester = remember { FocusRequester() }
                            if (isSelected) {
                                LaunchedEffect(Unit) {
                                    itemFocusRequester.requestFocus()
                                }
                            }

                            Column {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(32.dp)
                                        .background(backgroundColor)
                                        .clickable {
                                            setAudio(
                                                episode?.url!!,
                                                episode?.audios?.getOrNull(index)!!
                                            )
                                        }
                                        .focusRequester(itemFocusRequester)
                                        .focusable()
                                        .onFocusChanged { focusState ->
                                            isFocused = focusState.isFocused
                                        },
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        painter = painterResource(id = R.drawable.ic_sound),
                                        contentDescription = "Audio",
                                        tint = when {
                                            isSelected -> Color.White
                                            isFocused -> Color.White
                                            else -> Color.White.copy(alpha = 0.8f)
                                        },
                                        modifier = Modifier
                                            .size(24.dp)
                                            .then(
                                                if (isSelected) {
                                                    Modifier.background(
                                                        color = Color.Black.copy(alpha = 0.8f),
                                                        shape = androidx.compose.foundation.shape.CircleShape
                                                    )
                                                } else {
                                                    Modifier
                                                }
                                            )
                                    )
                                    episode?.audios?.getOrNull(index)?.let {
                                        Text(
                                            "  " + it.title,
                                            color = when {
                                                isFocused -> Color.Red
                                                else -> Color.White
                                            },
                                            style = when {
                                                isFocused -> LocalTextStyle.current.copy(
                                                    fontWeight = FontWeight.Bold
                                                )

                                                else -> LocalTextStyle.current
                                            }
                                        )
                                    }
                                }
                                HorizontalDivider(
                                    thickness = 1.dp,
                                    color = Color.White.copy(alpha = 0.2f)
                                )
                            }
                        }
                    }
                }
            }
        }
    }

    if (showEpisodeDialog) {
        Dialog(
            onDismissRequest = {
                showEpisodeDialog = false
                onShowEpisodeDialog(false)
            },
            properties = DialogProperties(
                usePlatformDefaultWidth = false,
            )
        ) {
            Surface(
                modifier = Modifier
                    .width(350.dp)
                    .height(400.dp)
                    .padding(1.dp)
                    .clip(MaterialTheme.shapes.small)
                    .border(
                        width = 1.dp,
                        color = Color.Gray.copy(alpha = 0.2f),
                        shape = MaterialTheme.shapes.medium
                    ),
                color = Color(0xFFB0E0E6).copy(alpha = 0.8f)
            ) {
                Column(
                    modifier = Modifier.padding(4.dp)
                ) {
                    LazyColumn {
                        items(episodes?.size ?: 0) { index ->
                            val isSelected =
                                episodes?.getOrNull(index)?.id == selectedEpisodeId
                            val itemFocusRequester = remember { FocusRequester() }
                            var isFocused by remember { mutableStateOf(false) }
                            if (isSelected) {
                                LaunchedEffect(Unit) {
                                    delay(50)
                                    itemFocusRequester.requestFocus()
                                }
                            }

                            Column {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(32.dp)
                                        .background(Color.Transparent)
                                        .clickable {
                                            setEpisode(episodes?.getOrNull(index)?.id!!)
                                        }
                                        .focusRequester(itemFocusRequester)
                                        .focusable()
                                        .onFocusChanged { focusState ->
                                            isFocused = focusState.isFocused
                                        },
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        Icons.Filled.PlayArrow,
                                        contentDescription = "Play",
                                        tint = when {
                                            isSelected -> Color.White
                                            isFocused -> Color.White
                                            else -> Color.White.copy(alpha = 0.8f)
                                        },
                                        modifier = Modifier
                                            .size(24.dp)
                                            .then(
                                                if (isSelected) {
                                                    Modifier.background(
                                                        color = Color.Black.copy(alpha = 0.8f),
                                                        shape = androidx.compose.foundation.shape.CircleShape
                                                    )
                                                } else {
                                                    Modifier
                                                }
                                            )
                                    )
                                    episodes?.getOrNull(index)?.let {
                                        Text(
                                            "  " + it.episodeTitle,
                                            color = when {
                                                isFocused -> Color.Red
                                                else -> Color.White
                                            },
                                            style = when {
                                                isFocused -> LocalTextStyle.current.copy(
                                                    fontWeight = FontWeight.Bold
                                                )

                                                else -> LocalTextStyle.current
                                            }
                                        )
                                    }
                                }
                                HorizontalDivider(
                                    thickness = 1.dp,
                                    color = Color.White.copy(alpha = 0.2f)
                                )
                            }
                        }
                    }
                }
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .align(Alignment.TopCenter)
                .padding(horizontal = 16.dp, vertical = 16.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = episode?.episodeTitle ?: "Untitled",
                color = Color.White,
                fontSize = 24.sp,
                style = MaterialTheme.typography.bodyLarge
            )
        }

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .align(Alignment.BottomCenter)
                .padding(horizontal = 16.dp, vertical = 80.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {

            Spacer(modifier = Modifier.weight(1f))

            Box(
                modifier = Modifier
                    .size(70.dp)
                    .onFocusChanged { focusState ->
                        isFocusedSpeed = focusState.isFocused
                    },
            ) {
                if (isFocusedSpeed) {
                    Text(
                        style = MaterialTheme.typography.bodyMedium,
                        fontSize = 16.sp,
                        color = Color.White,
                        text = "${player.playbackParameters.speed.toInt()}X",
                        modifier = Modifier
                            .align(Alignment.TopCenter)
                    )
                }

                IconButton(
                    onClick = {
                        val currentSpeed = player.playbackParameters.speed
                        val newSpeed = when {
                            currentSpeed < 1.5f -> 2f
                            currentSpeed < 2.5f -> 3f
                            currentSpeed < 3.5f -> 4f
                            else -> 1f
                        }
                        player.playbackParameters = player.playbackParameters.withSpeed(newSpeed)
                    },
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .size(40.dp)
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_speed),
                        contentDescription = "倍速"
                    )
                }
            }

            Box(
                modifier = Modifier
                    .size(70.dp)
                    .onFocusChanged { focusState ->
                        isFocusedEpisode = focusState.isFocused
                    },
            ) {
                if (isFocusedEpisode) {
                    Text(
                        style = MaterialTheme.typography.bodyMedium,
                        fontSize = 16.sp,
                        color = Color.White,
                        text = "选集",
                        modifier = Modifier
                            .align(Alignment.TopCenter)
                    )
                }

                IconButton(
                    onClick = {
                        if (episodes != null) {
                            showEpisodeDialog = true
                            onShowEpisodeDialog(true)
                        }
                    },
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .size(40.dp)
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_episode),
                        contentDescription = "选集"
                    )
                }
            }

            Box(
                modifier = Modifier
                    .size(70.dp)
                    .onFocusChanged { focusState ->
                        isFocusedSubtitle = focusState.isFocused
                    },
            ) {
                if (isFocusedSubtitle) {
                    Text(
                        style = MaterialTheme.typography.bodyMedium,
                        fontSize = 16.sp,
                        color = Color.White,
                        text = "字幕",
                        modifier = Modifier
                            .align(Alignment.TopCenter)
                    )
                }

                IconButton(
                    onClick = {
                        showSubtitleDialog = true
                        onShowSubtitleDialog(true)
                    },
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .size(40.dp)
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_comment),
                        contentDescription = "字幕"
                    )
                }
            }

            Box(
                modifier = Modifier
                    .size(70.dp)
                    .onFocusChanged { focusState ->
                        isFocusedAudio = focusState.isFocused
                    },
            ) {
                if (isFocusedAudio) {
                    Text(
                        style = MaterialTheme.typography.bodyMedium,
                        fontSize = 16.sp,
                        color = Color.White,
                        text = "音轨",
                        modifier = Modifier
                            .align(Alignment.TopCenter)
                    )
                }

                IconButton(
                    onClick = {
                        showAudioDialog = true
                        onShowAudioDialog(true)
                    },
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .size(40.dp)
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_sound),
                        contentDescription = "音轨"
                    )
                }
            }

        }

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .align(Alignment.BottomCenter)
                .padding(horizontal = 16.dp, vertical = 32.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                modifier = Modifier
                    .size(40.dp)
                    .focusRequester(sliderFocusRequester)
                    .focusable()
                    .onKeyEvent { event ->
                        if (event.type == KeyEventType.KeyDown) {
                            when (event.key) {
                                Key.DirectionLeft -> {
                                    player.seekTo(player.currentPosition - 15000)
                                    onShowController(true)
                                    true
                                }

                                Key.DirectionRight -> {
                                    player.seekTo(player.currentPosition + 15000)
                                    onShowController(true)
                                    true
                                }

                                else -> false
                            }
                        } else {
                            false
                        }
                    },
                colors = ButtonDefaults.colors(
                    containerColor = Color.Transparent,
                    contentColor = Color.White,
                ),
                onClick = {
                    if (player.isPlaying) {
                        player.pause()
                        isPlaying = false
                    } else {
                        player.play()
                        isPlaying = true
                    }
                }
            ) {
                if (isPlaying) {
                    Icon(
                        painterResource(id = R.drawable.ic_pause),
                        contentDescription = "Pause",
                        tint = Color.White,
                        modifier = Modifier
                            .fillMaxSize(),
                    )
                } else {
                    Icon(
                        Icons.Filled.PlayArrow,
                        contentDescription = "Play",
                        tint = Color.White,
                        modifier = Modifier
                            .fillMaxSize(),
                    )
                }
            }

            Slider(
                value = progress,
                onValueChange = { newValue ->
                    player.seekTo(newValue.toLong())
                },
                enabled = false,
                valueRange = 0f..maxProgress,
                colors = SliderDefaults.colors(
                    disabledThumbColor = Color.White,
                    disabledActiveTrackColor = Color.LightGray,
                    disabledInactiveTickColor = Color.DarkGray,
                ),
                modifier = Modifier
                    .weight(1f)
                    .height(4.dp)
                    .padding(horizontal = 2.dp),
            )

            Text(
                text = formattedRemainingTime,
                color = Color.White,
                style = MaterialTheme.typography.bodyLarge
            )

        }
    }
}

@OptIn(UnstableApi::class)
fun setSubtitleForPlayer(
    player: ExoPlayer,
    episodeUrl: String,
    subtitleUrl: String,
    context: Context,
    viewModel: ExoPlayerViewModel
) {
    try {
        val currentPosition = player.currentPosition
        viewModel.releaseP2P()
        viewModel.setupP2PML(episodeUrl, subtitleUrl)
        player.seekTo(currentPosition)
    } catch (e: Exception) {
        Log.e("Subtitle", "Error setting subtitle", e)
        Toast.makeText(context, "加载字幕失败", Toast.LENGTH_SHORT).show()
    }
}

@OptIn(UnstableApi::class)
fun setEpisodeForPlayer(
    episode: Episode,
    context: Context,
    viewModel: ExoPlayerViewModel
) {
    try {

        viewModel.releaseP2P()
        viewModel.setupP2PML(episode.url, null)
    } catch (e: Exception) {
        Log.e("Subtitle", "Error setting subtitle", e)
        Toast.makeText(context, "加载字幕失败", Toast.LENGTH_SHORT).show()
    }
}

fun formatRemainingTime(currentPosition: Long, duration: Long): String {
    if (duration <= 0) {
        return "00:00/00:00"
    }
    val totalMinutes = (duration / 60000).toInt()
    val totalSeconds = (duration % 60000 / 1000).toInt()
    val curMinutes = (currentPosition / 60000).toInt()
    val curSeconds = (currentPosition % 60000 / 1000).toInt()
    return String.format("%02d:%02d/%02d:%02d", curMinutes, curSeconds, totalMinutes, totalSeconds)
}

fun formatContinueTime(currentPosition: Long): String {
    val curMinutes = (currentPosition / 60000).toInt()
    val curSeconds = (currentPosition % 60000 / 1000).toInt()
    return String.format("%02d:%02d", curMinutes, curSeconds)
}