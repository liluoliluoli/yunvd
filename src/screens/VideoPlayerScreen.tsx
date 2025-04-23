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
    ScrollView, HWEvent, useTVEventHandler, TVFocusGuideView, Pressable,
} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {Page} from "../components/Page";
import {SupportedKeys} from "../remote-control/SupportedKeys";
import RemoteControlManager from "../remote-control/RemoteControlManager";
import Video, {VideoRef} from 'react-native-video';
import {CustomPressable} from "../components/CustomPressable";
import {GoPreviousSvg} from "../../assets/GoPreviousSvg";
import {RFPercentage} from "react-native-responsive-fontsize";
import {PlaySvg} from "../../assets/PlaySvg";
import {PauseSvg} from "../../assets/PauseSvg";


const {width} = Dimensions.get('window');
const sliderWidth = width * 0.9;
const thumbWidth = 20;
const seekTime = 5;
const longSeekTime = 15;

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
};


const VideoPlayerScreen = ({route, navigation}) => {
    const videoRef = useRef<VideoRef>(null);
    const [duration, setDuration] = useState(0);
    const [controlsVisible, setControlsVisible] = useState(true);
    const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [paused, setPaused] = useState(false);
    const [keyPressed, setKeyPressed] = useState(false);
    const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [previewTime, setPreviewTime] = useState(0);

    const passedVideo = route.params?.episode;

    const handleBack = useCallback(() => {
        navigation.goBack();
    }, []);

    const controlsOpenTimer = useCallback(() => {
        setControlsVisible(true);

        if (hideControlsTimeoutRef.current) {
            clearTimeout(hideControlsTimeoutRef.current);
        }

        hideControlsTimeoutRef.current = setTimeout(() => {
            setControlsVisible(false);
        }, 3000);
    }, []);

    useEffect(() => {
        controlsOpenTimer();
    }, [controlsOpenTimer]);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            console.log('backHandler');
            handleBack();
            return true;
        });
        return () => {
            backHandler.remove();
        };
    }, []);

    const seekForward = (type: 'press' | 'longPress' = 'press') => {
        seek(currentTime + (type === 'press' ? seekTime : longSeekTime));
        controlsOpenTimer();
    };

    const seekBackward = (type: 'press' | 'longPress' = 'press') => {
        seek(currentTime - (type === 'press' ? seekTime : longSeekTime));
        controlsOpenTimer();
    };

    const togglePausePlay = () => {
        setPaused(prev => !prev);
        controlsOpenTimer();
    };

    const handleLongPress = (direction: 'left' | 'right') => {
        const seekAmount = direction === 'left' ? -longSeekTime : longSeekTime;

        if (Platform.OS === 'ios') {
            // IOS: long press is triggered on start and finish pressing
            if (!keyPressed) {
                setKeyPressed(true);
                // Need to remember to pause the video because then we update preview time there and on video progress
                setPaused(true);
                longPressTimeoutRef.current = setInterval(() => {
                    setPreviewTime(prevPreviewTime => prevPreviewTime + seekAmount);
                    controlsOpenTimer();
                }, 200);
            } else {
                setKeyPressed(false);
                setPaused(false);
                clearInterval(longPressTimeoutRef.current || undefined);
                seek(previewTime);
            }
        } else {
            // ANDROID: long press is triggered from time to time while pressing
            const newPreviewTime = previewTime + seekAmount;
            setKeyPressed(true);
            setPaused(true);
            setPreviewTime(newPreviewTime);
            clearInterval(longPressTimeoutRef.current ?? undefined);
            longPressTimeoutRef.current = setTimeout(() => {
                setKeyPressed(false);
                setPaused(false);
                seek(newPreviewTime);
            }, 600);
        }
    };

    const seek = (time: number) => {
        const newTime = Math.max(0, Math.min(duration, time));
        videoRef.current?.seek(newTime);
        setCurrentTime(newTime);
        setPreviewTime(newTime);
        controlsOpenTimer();
    };

    const myTVEventHandler = (evt: HWEvent) => {
        const {eventType} = evt;

        if (eventType === 'playPause') {
            setPaused(prev => !prev);
        }

        if (
            [
                'playPause',
                'select',
                'up',
                'down',
                'left',
                'right',
                'longLeft',
                'longRight',
            ].includes(eventType)
        ) {
            controlsOpenTimer();
        }

        switch (eventType) {
            case 'select':
                togglePausePlay();
                break;
            case 'left':
                seekBackward();
                break;
            case 'right':
                seekForward();
                break;
            case 'longLeft':
                handleLongPress('left');
                break;
            case 'longRight':
                handleLongPress('right');
                break;
            default:
                break;
        }
    };

    useTVEventHandler(myTVEventHandler);


    // useEffect(() => {
    //     const handleKeyDown = (key: SupportedKeys) => {
    //         switch (key) {
    //             case SupportedKeys.Back:
    //                 console.log("Back")
    //                 navigation.goBack();
    //         }
    //     };
    //
    //     const listener = RemoteControlManager.addKeydownListener(handleKeyDown);
    //     return () => {
    //         RemoteControlManager.removeKeydownListener(listener);
    //     };
    // }, []);

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
        <View style={styles.container}>
            <Video
                // Can be a URL or a local file.
                source={{uri: passedVideo.videoUrl}}
                // Store reference
                ref={videoRef}
                // Callback when remote video is buffering
                onBuffer={() => console.log("onBuffer")}
                // Callback when the video cannot be loaded
                onError={() => console.log("onError")}
                style={styles.video}
                paused={paused}
                onProgress={({currentTime}) => {
                    setCurrentTime(currentTime);
                    setPreviewTime(currentTime);
                }}
                onLoad={({duration}) => setDuration(duration)}
            />
            {controlsVisible && (
                <View style={styles.controlsContainer}>
                    <TVFocusGuideView autoFocus>
                        <CustomPressable
                            style={styles.goBackBtn}
                            onPress={() => navigation.goBack()}>
                            <GoPreviousSvg width={RFPercentage(2)} height={RFPercentage(2)}/>
                        </CustomPressable>
                    </TVFocusGuideView>

                    <TVFocusGuideView style={styles.controls} autoFocus>
                        <CustomPressable
                            style={styles.controlButton}
                            hasTVPreferredFocus={true}>
                            {paused ? (
                                <PlaySvg
                                    style={styles.icon}
                                    width={RFPercentage(3.5)}
                                    height={RFPercentage(3.5)}
                                />
                            ) : (
                                <PauseSvg
                                    style={styles.icon}
                                    width={RFPercentage(3.5)}
                                    height={RFPercentage(3.5)}
                                />
                            )}
                        </CustomPressable>
                    </TVFocusGuideView>

                    <View style={styles.sliderContainer}>
                        <View style={styles.sliderTrack}/>
                        <TVFocusGuideView autoFocus>
                            <Pressable
                                style={({focused}) => [
                                    styles.sliderThumb,
                                    {
                                        left:
                                            (previewTime / duration) * (sliderWidth - thumbWidth) ||
                                            0,
                                        backgroundColor: focused ? '#b0b0b090' : '#fff',
                                    },
                                ]}
                            />
                        </TVFocusGuideView>
                    </View>

                    <View style={styles.timeContainer}>
                        <Text style={styles.timeText}>
                            {formatTime(previewTime)} / {formatTime(duration)}
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
};


const styles = StyleSheet.create({
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: '#f44336',
        fontSize: 16,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#a2a2a2d',
    },
    video: {
        width: width,
        height: width * (9 / 16),
        backgroundColor: '#000',
        zIndex: -10,
    },
    icon: {},
    goBackBtn: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        top: 40,
        left: 40,
    },
    controlsContainer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
    },
    controls: {
        position: 'absolute',
        bottom: RFPercentage(26),
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    controlButton: {
        marginHorizontal: 20,
    },
    sliderContainer: {
        position: 'absolute',
        bottom: 60,
        width: sliderWidth,
        marginHorizontal: (width - sliderWidth) / 2,
        height: 40,
        justifyContent: 'center',
    },
    sliderTrack: {
        position: 'absolute',
        width: '100%',
        height: 4,
        backgroundColor: '#FFFFFF',
    },
    sliderThumb: {
        position: 'absolute',
        width: 20,
        height: 20,
        top: -10,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
    },
    timeContainer: {
        position: 'absolute',
        bottom: 30,
        width: '100%',
        alignItems: 'center',
    },
    timeText: {
        color: '#fff',
        fontSize: RFPercentage(1),
    },
});

export default VideoPlayerScreen;
