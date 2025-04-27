import React, {useCallback, useEffect, useState} from 'react';
import {Image, StyleSheet, View,} from 'react-native';
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
import {formatTime, HEADER_SIZE} from "../utils/ApiConstants";
import {useVideoItemViewModel} from "../viewModels/VideoItemViewModel";

const VideoDetailScreen = ({route, navigation}) => {
    const passedVideo = route.params?.video;
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
        fetchVideo().then(() => setIsFavorite(video.isFavorite))
    }, [videoId]);

    useEffect(() => {
        if (video) {
            setIsFavorite(video.isFavorite);
        }
    }, [video]);

    const handelFavorite = useCallback(() => {
        updateFavorite().then(() => setIsFavorite(!isFavorite));
    }, [isFavorite]);

    const handleContinue = useCallback(() => {
        // 处理续播逻辑
    }, []);

    const handleNextEpisode = useCallback(() => {
        // 处理下一集逻辑
    }, []);

    const navigateToVideoPlayer = (episode, video) => {
        console.log('Navigating to video player with video:', video.lastPlayedPosition);
        navigation.push('VideoPlayer', {episode, video});
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
                                        label={video?.lastPlayedEpisodeId ? video?.episodes.find(item => item.id === video?.lastPlayedEpisodeId).episodeTitle + " [" + formatTime(video?.lastPlayedPosition) + "]" : "播放"}
                                        onSelect={() => console.log('续播!')}/>
                                    <Button label="下一集" onSelect={() => console.log('下一集!')}/>
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
