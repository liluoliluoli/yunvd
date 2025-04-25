import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
    BackHandler,
    Dimensions,
    HWEvent, Modal,
    Platform,
    Pressable,
    SafeAreaView, ScrollView,
    StyleSheet,
    Text, TVEventHandler,
    TVFocusGuideView,
    useTVEventHandler,
    View,
} from 'react-native';
import Video, {VideoRef} from 'react-native-video';
import {CustomPressable} from "../components/CustomPressable";
import {GoPreviousSvg} from "../../assets/GoPreviousSvg";
import {RFPercentage} from "react-native-responsive-fontsize";
import {PlaySvg} from "../../assets/PlaySvg";
import {PauseSvg} from "../../assets/PauseSvg";
import {CustomControlPressable} from "../components/CustomControlPressable";
import {SupportedKeys} from "../remote-control/SupportedKeys";
import RemoteControlManager from "../remote-control/RemoteControlManager";
import Episode from "../models/Episode";
import Subtitle from "../models/Subtitle";
import subtitle from "../models/Subtitle";
import LoadingIndicator from "../components/LoadingIndicator";


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
    const [focusedControl, setFocusedControl] = useState<'slider' | 'episodes' | 'subtitle'>('slider');
    const [showEpisodesModal, setShowEpisodesModal] = useState(false);
    const passedVideo = route.params?.video;
    const passedEpisodes = route.params?.video?.episodes || [];
    const passedEpisode = route.params?.episode;
    const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(passedEpisode);
    const [playingEpisode, setPlayingEpisode] = useState<Episode | null>(passedEpisode);
    const [showSubtitlesModal, setShowSubtitlesModal] = useState(false);
    const [selectedSubtitle, setSelectedSubtitle] = useState<Subtitle | null>(playingEpisode.subtitles[0]);
    const [playingSubtitle, setPlayingSubtitle] = useState<Subtitle | null>(playingEpisode.subtitles[0]);
    const [isVideoBuffering, setIsVideoBuffering] = useState<boolean>(false);


    const renderEpisodeItem = (episode, index) => (
        <CustomControlPressable
            key={index}
            hasTVPreferredFocus={episode.id === selectedEpisode.id}
        >
            <Text style={styles.episodeText}>{episode.episode}</Text>
        </CustomControlPressable>
    );

    const renderSubtitleItem = (subtitle, index) => (
        <CustomControlPressable
            key={index}
            hasTVPreferredFocus={subtitle.id === selectedSubtitle.id}
        >
            <Text style={styles.subtitleText}>{subtitle.subtitle}</Text>
        </CustomControlPressable>
    );

    const controlsOpenTimer = useCallback(() => {
        setControlsVisible(true);

        if (hideControlsTimeoutRef.current) {
            clearTimeout(hideControlsTimeoutRef.current);
        }
        if (!showEpisodesModal && !showSubtitlesModal) {
            hideControlsTimeoutRef.current = setTimeout(() => {
                setFocusedControl('slider');
                setControlsVisible(false);
                setShowEpisodesModal(false);
                setShowSubtitlesModal(false);
            }, 3000);
        }
    }, [showEpisodesModal, showSubtitlesModal]);

    useEffect(() => {
        controlsOpenTimer();
    }, [controlsOpenTimer]);

    const handleShowEpisodesModal = () => {
        setShowEpisodesModal(true);
    }

    const handleShowSubtitlesModal = () => {
        setShowSubtitlesModal(true);
    }

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
                if (!showSubtitlesModal && !showEpisodesModal && controlsVisible && focusedControl === 'slider') {
                    togglePausePlay();
                }
                if (showEpisodesModal) {
                    console.log('episodes selected:' + selectedEpisode.id + " to play");
                    setPlayingEpisode(selectedEpisode);
                    setShowEpisodesModal(false);
                    setFocusedControl('slider');
                }
                if (showSubtitlesModal) {
                    console.log('subtitle selected:' + selectedSubtitle.id + " to play");
                    setPlayingSubtitle(selectedSubtitle);
                    setShowSubtitlesModal(false);
                    setFocusedControl('slider');
                }
                break;
            case 'down':
                if (!showSubtitlesModal && !showEpisodesModal && controlsVisible && focusedControl === 'slider') {
                    setFocusedControl('episodes');
                }
                if (showEpisodesModal) {
                    var eIndex = passedEpisodes.findIndex(item => item.id === selectedEpisode.id);
                    console.log('down episodes selected index:' + eIndex);
                    if (eIndex != -1 && eIndex < passedEpisodes.length - 1) {
                        setSelectedEpisode(passedEpisodes[eIndex + 1]);
                    }
                }
                if (showSubtitlesModal) {
                    var sIndex = playingEpisode.subtitles.findIndex(item => item.id === selectedSubtitle.id);
                    console.log('down subtitle selected index:' + sIndex);
                    if (sIndex != -1 && sIndex < playingEpisode.subtitles.length - 1) {
                        setSelectedSubtitle(playingEpisode.subtitles[sIndex + 1]);
                    }
                }
                break;
            case 'up':
                if (!showSubtitlesModal && !showEpisodesModal && controlsVisible && (focusedControl === 'episodes' || focusedControl === 'subtitle')) {
                    setFocusedControl('slider');
                }
                if (showEpisodesModal) {
                    var eIndex = passedEpisodes.findIndex(item => item.id === selectedEpisode.id);
                    console.log('up episodes selected index:' + eIndex);
                    if (eIndex > 0) {
                        setSelectedEpisode(passedEpisodes[eIndex - 1]);
                    }
                }
                if (showSubtitlesModal) {
                    var sIndex = playingEpisode.subtitles.findIndex(item => item.id === selectedSubtitle.id);
                    console.log('up subtitle selected index:' + sIndex);
                    if (sIndex > 0) {
                        setSelectedSubtitle(playingEpisode.subtitles[sIndex - 1]);
                    }
                }
                break;
            case 'left':
                if (!showSubtitlesModal && !showEpisodesModal && controlsVisible && focusedControl === 'slider') {
                    seekBackward();
                } else if (!showSubtitlesModal && !showEpisodesModal && controlsVisible && focusedControl === 'subtitle') {
                    setFocusedControl('episodes');
                }
                break;
            case 'right':
                if (!showSubtitlesModal && !showEpisodesModal && controlsVisible && focusedControl === 'slider') {
                    seekForward();
                } else if (!showSubtitlesModal && !showEpisodesModal && controlsVisible && focusedControl === 'episodes') {
                    setFocusedControl('subtitle');
                }
                break;
            case 'longLeft':
                if (!showSubtitlesModal && !showEpisodesModal && focusedControl === 'slider') {
                    handleLongPress('left');
                }
                break;
            case 'longRight':
                if (!showSubtitlesModal && !showEpisodesModal && focusedControl === 'slider') {
                    handleLongPress('right');
                }
                break;
            default:
                break;
        }
    };

    useTVEventHandler(myTVEventHandler);

    useEffect(() => {
        const handleKeyDown = (key: SupportedKeys) => {
            switch (key) {
                case SupportedKeys.Back:
                    if (showEpisodesModal) {
                        setShowEpisodesModal(false);
                        return true;
                    } else {
                        navigation.goBack();
                        return true;
                    }
            }
            return false;
        };

        const listener = RemoteControlManager.addKeydownListener(handleKeyDown);
        return () => {
            RemoteControlManager.removeKeydownListener(listener);
        };
    }, [showEpisodesModal]);


    if (!passedEpisode || !passedEpisode.videoUrl) {
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
                source={{uri: playingEpisode.videoUrl}}
                ref={videoRef}
                onBuffer={(e) => setIsVideoBuffering(e.isBuffering)}
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
                            style={styles.title}>
                            <Text style={styles.titleButtonText}>{passedVideo.title} {playingEpisode.episode}</Text>
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
                                hasTVPreferredFocus={focusedControl === 'slider'}
                            />
                        </TVFocusGuideView>
                        <View style={styles.timeContainer}>
                            <Text style={styles.timeText}>
                                {formatTime(previewTime)} / {formatTime(duration)}
                            </Text>
                        </View>
                        <TVFocusGuideView style={styles.buttonsRow} autoFocus={false}>
                            <CustomControlPressable
                                style={styles.episodesButton}
                                onPress={handleShowEpisodesModal}
                                hasTVPreferredFocus={focusedControl === 'episodes'}
                            >
                                <Text style={styles.episodesButtonText}>选集</Text>
                            </CustomControlPressable>

                            <CustomControlPressable
                                style={styles.subtitleButton}
                                onPress={handleShowSubtitlesModal}
                                hasTVPreferredFocus={focusedControl === 'subtitle'}
                            >
                                <Text style={styles.subtitleButtonText}>字幕</Text>
                            </CustomControlPressable>
                        </TVFocusGuideView>

                        <Modal
                            visible={showEpisodesModal}
                            transparent={true}
                            animationType="slide"
                            onRequestClose={() => setShowEpisodesModal(false)}
                        >
                            <View style={styles.modalContainer}>
                                <View style={styles.modalEpisodeContent}>
                                    <ScrollView>
                                        {passedEpisodes.map(renderEpisodeItem)}
                                    </ScrollView>
                                </View>
                            </View>
                        </Modal>

                        <Modal
                            visible={showSubtitlesModal}
                            transparent={true}
                            animationType="slide"
                            onRequestClose={() => setShowSubtitlesModal(false)}
                        >
                            <View style={styles.modalContainer}>
                                <View style={styles.modalSubtitleContent}>
                                    <ScrollView>
                                        {playingEpisode.subtitles.map(renderSubtitleItem)}
                                    </ScrollView>
                                </View>
                            </View>
                        </Modal>
                    </View>
                </View>
            )}
            {isVideoBuffering && <LoadingIndicator/>}
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
    title: {
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
    buttonsRow: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: -30,
        left: 0,
        right: 0,
        justifyContent: 'center',
    },
    episodesButton: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 1,
    },
    episodesButtonText: {
        color: 'white',
        fontSize: 16,
    },
    subtitleButton: {
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 5,
    },
    subtitleButtonText: {
        color: 'white',
        fontSize: 16,
    },
    titleButtonText: {
        color: 'white',
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
    },
    modalEpisodeContent: {
        position: 'absolute',
        width: 250,
        height: 300,
        top: 150,
        left: 50,
    },
    episodeText: {
        color: 'white',
        fontSize: 16,
    },
    modalSubtitleContent: {
        position: 'absolute',
        width: 250,
        height: 300,
        top: 150,
        right: 50,
    },
    subtitleText: {
        color: 'white',
        fontSize: 16,
    },
});

export default VideoPlayerScreen;
