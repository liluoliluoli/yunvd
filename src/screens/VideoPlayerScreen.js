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
    BackHandler,
    ScrollView,
} from 'react-native';
import {VLCPlayer, VlCPlayerView} from 'react-native-vlc-media-player';
// import {TVEventHandler} from 'react-native-tvos';

const VideoPlayerScreen = ({route, navigation}) => {
    const [isTV, setIsTV] = useState(Dimensions.get('window').width > 800 || Platform.isTV);
    const passedVideo = route.params?.video;

    const handleBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            handleBack();
            return true;
        });
        return () => {
            backHandler.remove();
        };
    }, []);

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
            <View style={styles.tvContainer}>
                <View style={styles.tvTopContainer}>
                    <TouchableOpacity style={styles.tvVideoContainer} activeOpacity={1}>
                        <Player videoUrl={passedVideo.videoUrl} title={passedVideo.title}/>
                    </TouchableOpacity>
                    {/* 右上简介 */}
                    <View style={styles.tvInfoContainer}>
                        <Text style={styles.videoTitle}>{passedVideo.title}</Text>
                        <Text style={styles.videoDirectorText}>导演: {passedVideo.directors?.join(', ')}</Text>
                        <Text style={styles.videoActorText}>主演: {passedVideo.actors?.join(', ')}</Text>
                        <Text style={styles.videoGenreText}>类型: {passedVideo.genres?.join(', ')}</Text>
                        <Text style={styles.videoRegionText}>地区: {passedVideo.region}</Text>
                        <Text style={styles.videoYearText}>年代: {passedVideo.year}</Text>
                        <Text style={styles.videoYearText}>简介: {passedVideo.description}</Text>
                    </View>
                </View>
                <View style={styles.tvBottomContainer}>
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
        </SafeAreaView>
    );
};

type PlayerProps = {
    videoUrl: string;
    title: string;
};

const Player = ({videoUrl, title}: PlayerProps) => {
    // const [showSkipIntro, setShowSkipIntro] = useState(false);
    // const [intro, setIntro] = useState();

    // useEffect(() => {
    //     TVEventHandler.addListener(event => {
    //         if (event.eventType === 'bottom' && !videoViewRef.current?.isControlBarVisible) {
    //             videoViewRef.current?.showControlBar(true);
    //         }
    //     });
    // }, []);
    console.log(videoUrl);
    return (
        <>
            <VlCPlayerView
                url={videoUrl}
                // Orientation={Orientation}
                // showGG={false}
                // showTitle={true}
                title={title}
                showBack={true}
                onLeftPress={() => {
                }}
                autoPlay={true}
                style={{flex: 1}}
                initOptions={[
                    '--no-tls-verify',  // 禁用TLS证书验证
                    '--network-caching=3000',  // 增加网络缓存
                    '--rtsp-tcp',  // 强制使用TCP协议
                    '--tcp-timeout=60000',  // 增加TCP超时时间
                    '--no-audio',
                    '--rtsp-caching=150',
                    '--no-stats',
                    '--tcp-caching=150',
                    '--realrtsp-caching=150',
                    '--codec=avcodec'
                ]}
            />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
        color: '#000',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'left',
        padding: 10,
    },
    videoDirectorText: {
        color: '#000',
        fontSize: 12,
        paddingHorizontal: 10,
    },
    videoActorText: {
        color: '#000',
        fontSize: 12,
        paddingHorizontal: 10,
    },
    videoGenreText: {
        color: '#000',
        fontSize: 12,
        paddingHorizontal: 10,
    },
    videoRegionText: {
        color: '#000',
        fontSize: 12,
        paddingHorizontal: 10,
    },
    videoYearText: {
        color: '#000',
        fontSize: 12,
        paddingHorizontal: 10,
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
        backgroundColor: '#fff',
        marginBottom: 5,
        borderRadius: 5,
    },
    episodeItemText: {
        color: '#000',
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
    },
    tvVideoContainer: {
        flex: 2.3,
        backgroundColor: '#666',
    },
    tvInfoContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    tvBottomContainer: {
        height: '30%',  // 明确设置高度比例
        backgroundColor: '#fff',
    },
    videoWrapper: {
        width: '100%',
        height: '100%',
    },
});

export default VideoPlayerScreen;
