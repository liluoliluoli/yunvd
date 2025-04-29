import React, {useEffect, useState} from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {BottomArrow, TopArrow} from "../components/Arrows";
import {SpatialNavigationScrollView} from "react-tv-space-navigation";
import {scaledPixels} from "../hooks/useScale";
import {Page} from "../components/Page";
import {theme} from "../theme/theme";
import chunk from 'lodash/chunk';
import VideoItem from "../models/VideoItem";
import {VideoList} from "../components/VideoList";
import {Spacer} from "../components/Spacer";
import {useVideoListViewModel} from "../viewModels/VideoListViewModel";
import {VT_MOVIE} from "../utils/ApiConstants";
import LoadingIndicator from "../components/LoadingIndicator";

const HEADER_SIZE = scaledPixels(400)
export default function FavoriteScreen({route, navigation}) {
    const [videosByRow, setVideosByRow] = useState<VideoItem[][]>([]);
    const [down, setDown] = useState(false);
    const {
        videos,
        setVideos,
        isLoading,
        error,
        currentPage,
        search,
        sort,
        setSort,
        genre,
        setGenre,
        region,
        setRegion,
        year,
        setYear,
        videoType,
        setVideoType,
        setIsHistory,
        fetchSearchVideos,
        setCurrentPage,
        setHasMore,
        hasMore,
        setIsRefresh,
        isRefresh,
        fetchFavoriteVideos,
        favoriteCount
    } = useVideoListViewModel();

    useEffect(() => {
        console.log(`videos total ${videos.length}`);
        setVideosByRow(chunk(videos, 5));
    }, [videos]);

    useEffect(() => {
        if (currentPage !== 0) {
            fetchFavoriteVideos()
        }
    }, [currentPage]);

    useEffect(() => {
        if (down) {
            setDown(false)
            setCurrentPage(prev => prev + 1);
        }
    }, [down]);

    useEffect(() => {
        setCurrentPage(1);
    }, []);

    const navigateToVideoDetails = (video) => {
        console.log('Navigating to video detail with video:', video.title);
        navigation.push('VideoDetail', {video});
    };

    return (
        <Page loadMore={() => setDown(true)}>
            <SafeAreaView style={styles.container}>
                <SpatialNavigationScrollView
                    offsetFromStart={HEADER_SIZE + 20}
                    descendingArrow={<TopArrow/>}
                    ascendingArrow={<BottomArrow/>}
                    descendingArrowContainerStyle={styles.topArrowContainer}
                    ascendingArrowContainerStyle={styles.bottomArrowContainer}
                >
                    <View style={styles.header}>
                        <Text style={styles.favoriteCount}>收藏数：{favoriteCount}</Text>
                        <Spacer direction={"vertical"} gap={'$2'}/>
                        <View style={styles.divider}/>
                    </View>
                    <VideoList
                        videosByRow={videosByRow}
                        onVideoPress={navigateToVideoDetails}
                    />

                </SpatialNavigationScrollView>
                {isLoading && <LoadingIndicator/>}
            </SafeAreaView>
        </Page>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },
    filterRow: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        marginBottom: 4,
        overflow: 'scroll'
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
    leftArrowContainer: {
        width: 120,
        height: scaledPixels(260) + 2 * theme.spacings.$8,
        position: 'absolute',
        top: 0,
        justifyContent: 'center',
        alignItems: 'center',
        left: -theme.spacings.$8,
    },
    rightArrowContainer: {
        width: 120,
        height: scaledPixels(260) + 2 * theme.spacings.$8,
        position: 'absolute',
        top: 0,
        justifyContent: 'center',
        alignItems: 'center',
        right: -theme.spacings.$8,
    },
    header: {
        marginBottom: theme.spacings.$2,
    },
    favoriteCount: {
        color: 'white',
        fontSize: 16,
        marginBottom: theme.spacings.$2,
    },
    divider: {
        height: 0.5,
        backgroundColor: 'white',
        width: '100%',
    },
});
