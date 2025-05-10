import React, {useCallback, useEffect, useState} from 'react';
import {Image, NativeModules, StyleSheet, View,} from 'react-native';
import {SpatialNavigationNode, SpatialNavigationScrollView} from "react-tv-space-navigation";
import {scaledPixels} from "../hooks/useScale";
import {Page} from "../components/Page";
import {BottomArrow, TopArrow} from "../components/Arrows";
import styled from "@emotion/native";
import {Typography} from "../components/Typography";
import {Button} from "../components/Button";
import {Spacer} from "../components/Spacer";
import {theme} from "../theme/theme";
import {Episode} from "../components/Episode";
import {formatTime, HEADER_SIZE, STORAGE_KEYS} from "../utils/ApiConstants";
import {useVideoItemViewModel} from "../viewModels/VideoItemViewModel";
import Toast from "react-native-simple-toast";
import {useFocusEffect} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const VideoDetailScreen = ({route, navigation}) => {
    const passedVideo = route.params?.video;
    const [lastPlayedEpisodeId, setLastPlayedEpisodeId] = useState<number>();
    const [lastPlayedPosition, setLastPlayedPosition] = useState<number>();
    const {
        video,
        videoId,
        setVideoId,
        isLoading,
        error,
        fetchVideo,
        isFavorite,
        setIsFavorite,
        updateFavorite,
    } = useVideoItemViewModel();

    useEffect(() => {
        setVideoId(passedVideo.id);
        fetchVideo().then(() => {
            setIsFavorite(video.isFavorite);
        })
    }, [videoId]);

    useEffect(() => {
        if (video) {
            setLastPlayedPosition(video.lastPlayedPosition);
            setLastPlayedEpisodeId(video.lastPlayedEpisodeId);
            setIsFavorite(video.isFavorite);
        }
    }, [video]);

    useFocusEffect(
        useCallback(() => {
            const updateLastPlayedInfo = async () => {
                try {
                    const historyJson = await AsyncStorage.getItem(STORAGE_KEYS.WATCH_HISTORY);
                    if (historyJson) {
                        const historyData = JSON.parse(historyJson);
                        // 筛选出与当前视频 videoId 对应的记录
                        const currentVideoHistory = Array.isArray(historyData)
                            ? historyData.filter(item => item.videoId === passedVideo.id)
                            : [historyData].filter(item => item.videoId === passedVideo.id);

                        if (currentVideoHistory.length > 0) {
                            // 找到最新的记录
                            const latestRecord = currentVideoHistory.reduce((prev, current) =>
                                new Date(prev.timestamp) > new Date(current.timestamp) ? prev : current
                            );
                            console.log("video.lastPlayedTime.getTime():" + video?.lastPlayedTime);
                            console.log("latestRecord.timestamp:" + latestRecord.timestamp);
                            if (video && latestRecord.timestamp > video?.lastPlayedTime) {
                                video.lastPlayedEpisodeId = latestRecord.episodeId;
                                video.lastPlayedPosition = latestRecord.position;
                                video.lastPlayedTime = latestRecord.timestamp;
                                setLastPlayedPosition(video.lastPlayedPosition);
                                setLastPlayedEpisodeId(video.lastPlayedEpisodeId);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error fetching watch history:', error);
                }
            };

            updateLastPlayedInfo();
        }, [passedVideo.id, video])
    );


    const handelFavorite = useCallback(() => {
        updateFavorite().then(() => setIsFavorite(!isFavorite));
    }, [isFavorite, videoId]);

    const handleContinue = useCallback(() => {
        if (!video) {
            return;
        }
        if (video.lastPlayedEpisodeId) {
            const episode = video.episodes.find(item => item.id === video?.lastPlayedEpisodeId)
            console.log("video lastPlayedPosition:" + video.lastPlayedPosition)
            navigation.push('VideoPlayer', {episode, video});
        } else {
            const episode = video?.episodes[0]
            navigation.push('VideoPlayer', {episode, video});
        }
    }, [video]);

    const handleNextEpisode = useCallback(() => {
        if (!video) {
            return;
        }
        const lastPlayedIndex = video.episodes.findIndex(item => item.id === lastPlayedEpisodeId)
        if (lastPlayedIndex === -1) {
            const episode = video?.episodes[0]
            navigation.push('VideoPlayer', {episode, video});
        } else {
            if (lastPlayedIndex + 1 >= video.episodes.length) {
                Toast.show("当前已经是最后一集", Toast.SHORT);
            } else {
                const episode = video?.episodes[lastPlayedIndex + 1]
                navigation.push('VideoPlayer', {episode, video});
            }
        }
    }, [video]);

    const navigateToVideoPlayer = (episode, video) => {
        console.log('Navigating to video player with video:', NativeModules.YvdIntent);
        // navigation.push('VideoPlayer', {episode, video});
        NativeModules.YvdIntent.startActivityFromRN("com.zyun.yvdintent.MainActivity", "sdsdsd");
    };

    return (
        <Page>
            <View style={styles.container}>
                <SpatialNavigationScrollView
                    offsetFromStart={HEADER_SIZE + 20}
                    descendingArrow={<TopArrow/>}
                    ascendingArrow={<BottomArrow/>}
                    descendingArrowContainerStyle={styles.topArrowContainer}
                    ascendingArrowContainerStyle={styles.bottomArrowContainer}
                >
                    <SpatialNavigationNode orientation={'horizontal'}>
                        <Container height={scaledPixels(500)}>
                            <ImageContainer>
                                <ProgramImage source={{uri: passedVideo?.thumbnail}}/>
                            </ImageContainer>
                            <InformationContainer>
                                <Typography variant="title"
                                            style={{textAlign: 'center'}}>{passedVideo?.title}{video?.episodes.length && "("}{video?.episodes.length}{video?.episodes.length && ")"}</Typography>
                                <Spacer gap={'$6'}/>
                                <Tag variant="body"
                                     style={{textAlign: 'center'}}>{passedVideo?.region} {passedVideo?.publishMonth} {passedVideo?.genres?.join('/')}</Tag>
                                <Actor variant="body"
                                       style={{textAlign: 'center'}}>{passedVideo?.directors?.map(actor => actor.name).join(' / ')}</Actor>
                                <Actor variant="body"
                                       style={{textAlign: 'center'}}>{passedVideo?.actors?.map(actor => actor.name).join(' / ')}</Actor>
                                <Description variant="body"
                                             style={{textAlign: 'center'}}>{passedVideo?.description}</Description>
                                <ButtonContainer>
                                    <Button label={isFavorite ? '已收藏' : '收藏'}
                                            onSelect={handelFavorite}/>
                                    <Button
                                        label={lastPlayedEpisodeId ? video?.episodes.find(item => item.id === lastPlayedEpisodeId).episodeTitle + " [" + formatTime(lastPlayedPosition) + "]" : "播放"}
                                        onSelect={handleContinue}/>
                                    <Button label="下一集" onSelect={handleNextEpisode}/>
                                </ButtonContainer>
                            </InformationContainer>
                        </Container>
                    </SpatialNavigationNode>
                    {video?.episodes?.map((episode, index) => (
                        <Episode key={index} id={episode.id} label={episode.episodeTitle}
                                 onSelect={() => navigateToVideoPlayer(episode, video)}/>
                    ))}
                </SpatialNavigationScrollView>
            </View>
        </Page>
    );
};

const InformationContainer = styled.View({
    flex: 2,
});

const ButtonContainer = styled.View(({}) => ({
    flexDirection: 'row',
    gap: theme.spacings.$6,
    flex: 1.1,
    justifyContent: 'space-between',
    marginLeft: 10,
    marginRight: 10,
}));

const ImageContainer = styled.View({
    flex: 1
});

const Tag = styled(Typography)({
    flex: 1,
});

const Actor = styled(Typography)({
    flex: 1,
});

const Description = styled(Typography)({
    flex: 3,
});

const Container = styled.View<{ height: number }>(({height}) => ({
    height: height,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacings.$6,
}));

const ProgramImage = styled(Image)({
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: 20,
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#1a1a1a',
        padding: 10,
    },
    favorite: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginRight: 5,
    },
    continue: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginLeft: 5,
    },
    topArrowContainer: {
        width: '100%',
        height: 100,
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        top: -15,
        left: 0,
    },
    bottomArrowContainer: {
        width: '100%',
        height: 100,
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        bottom: -15,
        left: 0,
    },
});

export default VideoDetailScreen;
