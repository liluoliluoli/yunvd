import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    SafeAreaView,
    StatusBar,
    Platform,
    BackHandler, ScrollView
} from 'react-native';
import {VideoView, useVideoPlayer} from "expo-video";
import * as ScreenOrientation from 'expo-screen-orientation';


const VideoPlayerScreen = ({route, navigation}) => {
    const [isTV, setIsTV] = useState(Dimensions.get('window').width > 800 || Platform.isTV);
    const passedVideo = route.params?.video;
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showTitle, setShowTitle] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const videoRef = useRef(null);
    const [dimensions, setDimensions] = useState(Dimensions.get('window'));
    const player = useVideoPlayer(passedVideo.videoUrl, player => {
        player.currentTime = 100;
        player.play();
    });
    const toggleFullscreen = async () => {
        // if (!isFullscreen) {
        //     // 进入全屏并锁定横屏
        //     await ScreenOrientation.lockAsync(
        //         ScreenOrientation.OrientationLock.LANDSCAPE
        //     );
        //     setIsFullscreen(true);
        // } else {
        //     // 退出全屏恢复竖屏
        //     await ScreenOrientation.lockAsync(
        //         ScreenOrientation.OrientationLock.PORTRAIT
        //     );
        //     setIsFullscreen(false);
        // }
    };

    useEffect(() => {
        // StatusBar.setHidden(true);
        handleTap();
        const windowSubscription = Dimensions.addEventListener('change', ({window}) => {
            setIsTV(window.width > window.height || Platform.isTV);
            setDimensions(window);
        });

        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            handleBack();
            return true;
        });

        const playerSubscription = player.addListener('statusChange', ({status, error}) => {
            console.log('Player status changed: ', status);
            if (status === "loading") {
                setIsLoading(true);
            } else {
                setIsLoading(false);
            }
        });

        return () => {
            // StatusBar.setHidden(false);
            windowSubscription.remove();
            backHandler.remove();
            playerSubscription.remove();
        };
    }, []);

    const handleBack = useCallback(() => {
        // StatusBar.setHidden(false);
        navigation.goBack();
    }, [navigation]);

    const handleTap = () => {
        setShowTitle(true);
        setTimeout(() => setShowTitle(false), 5000);
    };

    if (!passedVideo || !passedVideo.videoUrl) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>No video found to play</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={handleBack}>
                        <Text style={styles.buttonText}>Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {!isTV && (
                <>
                    <View style={styles.headerContainer}>
                        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                            <Text style={styles.backButtonText}>←</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.videoContainer} activeOpacity={1} onPress={handleTap}>
                        {Platform.OS === 'web' ? (
                            <video
                                style={styles.video}
                                src={passedVideo.videoUrl}
                                poster={passedVideo.thumbnail}
                                controls
                                autoPlay
                            />
                        ) : VideoView ? (
                            <VideoView
                                ref={videoRef}
                                style={styles.video}
                                allowsFullscreen
                                allowsPictureInPicture
                                nativeControls
                                player={player}
                                onFullscreenEnter={toggleFullscreen}
                                onFullscreenExit={toggleFullscreen}
                                onError={() => setError('Video playback error')}
                            />
                        ) : (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>Video playback not available.</Text>
                            </View>
                        )}
                        {showTitle && (
                            <View style={styles.videoTitleContainer}>
                                <Text style={styles.videoTitle}>{passedVideo.title}</Text>
                            </View>
                        )}
                        {isLoading && (
                            <View style={styles.loadingOverlay}>
                                <ActivityIndicator size="large" color="#f44336"/>
                                <Text style={styles.loadingText}>Loading video...</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* 添加影片信息 */}
                    <View style={styles.videoInfoContainer}>
                        <Text style={styles.videoInfoText}>影片描述: {passedVideo.description}</Text>
                        <Text style={styles.videoInfoText}>演员: {passedVideo.description}</Text>

                    </View>
                    <View style={styles.episodeHeadContainer}>
                        <Text style={styles.episodeListTitle}>集数列表</Text>
                    </View>
                    {/* 添加集数列表 */}
                    <ScrollView style={styles.episodeListContainer}>
                        {passedVideo.episodes && passedVideo.episodes.map((episode, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.episodeItem}
                                // onPress={() => handleEpisodePress(episode)}
                            >
                                <Text style={styles.episodeItemText}>第 {episode.episode} 集</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </>
            )}
            {isTV && (
                <View style={styles.tvContainer}>
                    {/* 左上视频播放器 */}
                    <View style={styles.tvTopContainer}>
                        <TouchableOpacity style={styles.tvVideoContainer} activeOpacity={1} onPress={handleTap}>
                            {VideoView ? (
                                <VideoView
                                    ref={videoRef}
                                    style={styles.video}
                                    allowsFullscreen
                                    allowsPictureInPicture
                                    nativeControls
                                    player={player}
                                    onFullscreenEnter={toggleFullscreen}
                                    onFullscreenExit={toggleFullscreen}
                                    onError={() => setError('Video playback error')}
                                />
                            ) : (
                                <View style={styles.errorContainer}>
                                    <Text style={styles.errorText}>Video playback not available.</Text>
                                </View>
                            )}
                            {showTitle && (
                                <View style={styles.videoTitleContainer}>
                                    <Text style={styles.videoTitle}>{passedVideo.title}</Text>
                                </View>
                            )}
                            {isLoading && (
                                <View style={styles.loadingOverlay}>
                                    <ActivityIndicator size="large" color="#f44336"/>
                                    <Text style={styles.loadingText}>Loading video...</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        {/* 右上简介 */}
                        <View style={styles.tvInfoContainer}>
                            <Text style={styles.videoTitle}>{passedVideo.title}</Text>
                            <Text style={styles.videoInfoText}>TV影片描述: {passedVideo.description}</Text>
                            <Text style={styles.videoInfoText}>TV演员: {passedVideo.description}</Text>
                        </View>
                    </View>
                    {/* 下部集数列表 */}
                    <View style={styles.tvBottomSection}>
                        <ScrollView>
                            {passedVideo.episodes && passedVideo.episodes.map((episode, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.episodeItem}
                                    // onPress={() => handleEpisodePress(episode)}
                                >
                                    <Text style={styles.episodeItemText}>第 {episode.episode} 集</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    headerContainer: {
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 10,
    },
    backButton: {
        padding: 5,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 5,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 18,
    },
    videoContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
    },
    video: {
        width: '100%',
        height: '100%', // 修改为 100%
        aspectRatio: 16 / 9, // 添加视频比例
    },
    videoTitleContainer: {
        position: 'absolute',
        top: 20,
        alignSelf: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 8,
        borderRadius: 5,
    },
    videoTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: '#f44336',
        fontSize: 16,
    },
    retryButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#f44336',
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    loadingText: {
        color: '#fff',
        marginTop: 10,
    },

    videoInfoContainer: {
        backgroundColor: '#111',
        width: '100%',
        flex: 0.4,
    },
    videoInfoText: {
        color: '#fff',
        fontSize: 14,
        marginBottom: 5,
    },

    episodeHeadContainer: {
        backgroundColor: '#111',
        width: '100%',
        height: 30,
    },

    episodeListContainer: {
        padding: 10,
        backgroundColor: '#111',
        width: '100%',
        flex: 1,
    },
    episodeListTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    episodeItem: {
        padding: 10,
        backgroundColor: '#222',
        marginBottom: 5,
        borderRadius: 5,
    },
    episodeItemText: {
        color: '#fff',
        fontSize: 14,
    },

    // 电视布局样式
    tvContainer: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#fff',
    },
    tvTopContainer: {
        flex: 1,
        flexDirection: 'row',
        height: '70%',  // 明确设置高度比例
    },
    tvVideoContainer: {
        flex: 2,
        backgroundColor: '#000',  // 修改背景色
    },
    tvInfoContainer: {
        flex: 1,
        backgroundColor: '#111',
        padding: 20,
    },
    tvBottomSection: {
        height: '30%',  // 明确设置高度比例
        backgroundColor: '#111',
    },
    videoWrapper: {
        width: '100%',
        height: '100%',
    },
});

export default VideoPlayerScreen;
