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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import androidx.tv.material3.ButtonDefaults
import androidx.tv.material3.Icon
import androidx.tv.material3.IconButton
import androidx.tv.material3.Text
import com.zyun.yvdintent.R
import com.zyun.yvdintent.viewmodel.Episode
import com.zyun.yvdintent.viewmodel.ExoPlayerViewModel
import com.zyun.yvdintent.viewmodel.Subtitle
import com.zyun.yvdintent.viewmodel.SubtitleApi
import kotlinx.coroutines.delay

@UnstableApi
@Composable
fun ExoPlayerScreen(
    viewModel: ExoPlayerViewModel,
    domain: String,
    initialEpisodeId: Long,
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
                }
                if (playbackState == Player.STATE_BUFFERING) {
                    isPlayerReady = false
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
        while (true) {
            if (viewModel.player.isPlaying && viewModel.player.duration > 0) {
                progress = viewModel.player.currentPosition.toFloat()
                formattedRemainingTime =
                    formatRemainingTime(viewModel.player.currentPosition, viewModel.player.duration)
            }
            delay(1000L)
        }
    }

    LaunchedEffect(showController) {
        if (showController) {
            Log.i("test", "==========screenFocusRequester.unFocus()")
            delay(100)
            sliderFocusRequester.requestFocus()
            while (showController && System.currentTimeMillis() - lastInteractionTime < 5000) {
                delay(5000L)
            }
            showController = false
        }
    }

    LaunchedEffect(episodeId) {
        try {
            isLoading = true
            episode = SubtitleApi.getEpisode(
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
                        Key.DirectionDown, Key.DirectionCenter -> {
                            showController = true
                            lastInteractionTime = System.currentTimeMillis()
                            true
                        }

                        Key.DirectionLeft, Key.DirectionRight -> {
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
                    //this.resizeMode = AspectRatioFrameLayout.RESIZE_MODE_ZOOM
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
                    }
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
    onShowController: (Boolean) -> Unit
) {
    var isPlaying by remember { mutableStateOf(player.isPlaying) }
    var isFocusedSubtitle by remember { mutableStateOf(false) }
    var isFocusedAudio by remember { mutableStateOf(false) }
    var isFocusedSpeed by remember { mutableStateOf(false) }
    var showSubtitleDialog by remember { mutableStateOf(false) }
    val subtitleDialogFocusRequester = remember { FocusRequester() }
    var selectedSubtitle by remember { mutableStateOf<Subtitle?>(null) }
    var showEpisodeDialog by remember { mutableStateOf(false) }
    val episodeDialogFocusRequester = remember { FocusRequester() }
    var selectedEpisodeId by remember { mutableLongStateOf(0) }

    fun setSubtitle(episodeUrl: String, subtitle: Subtitle) {
        selectedSubtitle = subtitle
        setSubtitleForPlayer(player, episodeUrl, subtitle.url, context, viewModel)
        showSubtitleDialog = false
    }

    fun setEpisode(episodeId: Long) {
        selectedEpisodeId = episodeId
        onEpisodeChanged(episodeId)
        showEpisodeDialog = false
    }

    if (showSubtitleDialog) {
        Dialog(
            onDismissRequest = { showSubtitleDialog = false },
            properties = DialogProperties(usePlatformDefaultWidth = false)
        ) {
            Surface(
                modifier = Modifier
                    .width(400.dp)
                    .padding(16.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Text(
                        "选择字幕",
                        style = MaterialTheme.typography.headlineSmall,
                        modifier = Modifier.padding(bottom = 16.dp)
                    )

                    LazyColumn {
                        items(episode?.subtitles?.size ?: 0) { index ->
                            val isSelected =
                                episode?.subtitles?.getOrNull(index) == selectedSubtitle
                            val backgroundColor =
                                if (isSelected) MaterialTheme.colorScheme.primaryContainer else Color.Transparent

                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(backgroundColor)
                                    .clickable {
                                        setSubtitle(
                                            episode?.url!!,
                                            episode?.subtitles?.getOrNull(index)!!
                                        )
                                    }
                                    .padding(16.dp)
                                    .focusRequester(subtitleDialogFocusRequester)
                                    .focusable()
                            ) {
                                episode?.subtitles?.getOrNull(index)?.let {
                                    Text(
                                        it.title,
                                        color = if (isSelected) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurface
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        // 自动请求焦点
        LaunchedEffect(showSubtitleDialog) {
            if (showSubtitleDialog) {
                subtitleDialogFocusRequester.requestFocus()
            }
        }
    }

    if (showEpisodeDialog) {
        Dialog(
            onDismissRequest = { showEpisodeDialog = false },
            properties = DialogProperties(usePlatformDefaultWidth = false)
        ) {
            Surface(
                modifier = Modifier
                    .width(400.dp)
                    .padding(16.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Text(
                        "选择集数",
                        style = MaterialTheme.typography.headlineSmall,
                        modifier = Modifier.padding(bottom = 16.dp)
                    )

                    LazyColumn {
                        items(episodes?.size ?: 0) { index ->
                            val isSelected =
                                episodes?.getOrNull(index)?.id == selectedEpisodeId
                            val backgroundColor =
                                if (isSelected) MaterialTheme.colorScheme.primaryContainer else Color.Transparent

                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(backgroundColor)
                                    .clickable {
                                        setEpisode(episodes?.getOrNull(index)?.id!!)
                                    }
                                    .padding(16.dp)
                                    .focusRequester(episodeDialogFocusRequester)
                                    .focusable()
                            ) {
                                episodes?.getOrNull(index)?.let {
                                    Text(
                                        it.episodeTitle,
                                        color = if (isSelected) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurface
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        // 自动请求焦点
        LaunchedEffect(showSubtitleDialog) {
            if (showSubtitleDialog) {
                subtitleDialogFocusRequester.requestFocus()
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
                        text = "倍速",
                        modifier = Modifier
                            .align(Alignment.TopCenter)
                    )
                }

                IconButton(
                    onClick = {

                    },
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .size(40.dp)
                        .focusable()
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
                        isFocusedAudio = focusState.isFocused
                    },
            ) {
                if (isFocusedAudio) {
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
                        }
                    },
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .size(40.dp)
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_sound),
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
                        if (episode?.subtitles?.isNotEmpty() == true) {
                            showSubtitleDialog = true
                        }
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
    val remainingMillis = duration - currentPosition
    val minutes = (remainingMillis / 60000).toInt()
    val seconds = (remainingMillis % 60000 / 1000).toInt()
    return String.format("%02d:%02d", minutes, seconds)
}