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
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {Chapter, useVideoPlayer, VideoPlayer, VideoSource, VideoView} from 'react-native-vlc-media-player-view';
import {VideoViewRef} from "react-native-vlc-media-player-view/build/VideoView";
import {Page} from "../components/Page";
import {SupportedKeys} from "../remote-control/SupportedKeys";
import RemoteControlManager from "../remote-control/RemoteControlManager";

const SHOW_NATIVE_CONTROLS = Platform.OS === "ios";

const VideoPlayerScreen = ({route, navigation}) => {
    const videoViewRef = useRef<VideoViewRef>(null);
    const passedVideo = route.params?.episode;
    const [source, setSource] = useState<VideoSource>({
        uri: passedVideo.videoUrl.replace('https://', 'http://'),
        time: 1000
    });

    const handleBack = useCallback(() => {
        // setSource(undefined)
        navigation.goBack();
    }, [navigation]);

    useEffect(() => {
        if (SHOW_NATIVE_CONTROLS) return;
        const handleKeyDown = (key: SupportedKeys) => {
            switch (key) {
                case SupportedKeys.Right:
                case SupportedKeys.Left:
                case SupportedKeys.Down:
                    videoViewRef.current.showControlBar(true)
                    break;
                case SupportedKeys.Back:
                    handleBack();
                    break;
            }
        };

        const listener = RemoteControlManager.addKeydownListener(handleKeyDown);
        return () => {
            RemoteControlManager.removeKeydownListener(listener);
        };
    }, []);

    if (!passedVideo || !passedVideo.videoUrl) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>No video found to play</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <GestureHandlerRootView style={styles.container}>
            {source &&
                <Player ref={videoViewRef} source={source} onBack={handleBack} title={passedVideo.title}/>}
        </GestureHandlerRootView>
    );
};

type PlayerProps = {
    onBack: (player: VideoPlayer) => void;
    source: VideoSource;
    title: string;
};

const Player = React.forwardRef<VideoViewRef, PlayerProps>(({onBack, source, title}, ref) => {
        const player = useVideoPlayer({
            initOptions: [
                '--network-caching=150',
            ],
        }, player => {
            player.title = title;
            player.play(source);
        });

        const [showSkipIntro, setShowSkipIntro] = useState(false);
        const [intro, setIntro] = useState<Chapter>();

        return (
            <VideoView
                ref={ref}
                player={player}
                style={{flex: 1}}
                alwaysFullscreen={true}
                onLoaded={() => {
                    // source.time && (player.time = source.time);
                    // setIntro(player.chapters.find(c => c.name.match(/(opening)/i)));

                    // set fullscreen programmatically
                    // videoViewRef.current?.setFullscreen(true);

                    // set time manually
                    // player.time = 60 * 1000;
                    // console.log(player.time);
                    // change audio audio/subtitles tracks
                    // player.selectedAudioTrackId = player.audioTracks[player.audioTracks.length - 1].id;
                    // player.selectedTextTrackId = player.textTracks[player.textTracks.length - 1].id;
                }}
                // onNext={() => console.log('next')}
                // onPrevious={() => console.log('previous')}
                // onBack={() => onBack(player)}
                onProgress={e => {
                    // const time = e.nativeEvent.time;
                    // const isInIntro = !!intro && time >= intro.timeOffset && time < intro.timeOffset + intro.duration - 1;
                    // setShowSkipIntro(isInIntro);
                }}
                onFullscreen={(fullscreen) => {
                    console.log(fullscreen);
                }}
            />
        );
    }
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
});

export default VideoPlayerScreen;
