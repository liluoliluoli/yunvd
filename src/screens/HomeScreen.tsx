import React, {useEffect, useState} from 'react';
import {SafeAreaView, StyleSheet, View} from 'react-native';
import {BottomArrow, TopArrow} from "../components/Arrows";
import {SpatialNavigationScrollView} from "react-tv-space-navigation";
import {scaledPixels} from "../hooks/useScale";
import {Page} from "../components/Page";
import {theme} from "../theme/theme";
import chunk from 'lodash/chunk';
import Video from "../models/Video";
import {HEADER_SIZE, TAB_ROUTES} from "../utils/ApiConstants";
import {Header} from "../components/Header";
import {TabBar} from "../components/Tabbar";
import {VideoList} from "../components/VideoList";
import {useVideoListViewModel} from '../viewModels/VideoListViewModel';
import LoadingIndicator from "../components/LoadingIndicator";


export default function HomeScreen({route, navigation}) {
    const [videosByRow, setVideosByRow] = useState<Video[][]>([]);
    const [down, setDown] = useState(false);
    const [index, setIndex] = useState(0);
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
            fetchSearchVideos()
        }
    }, [currentPage]);

    useEffect(() => {
        if (down) {
            setDown(false)
            setCurrentPage(prev => prev + 1);
        }
    }, [down]);

    useEffect(() => {
        setIsHistory(true);
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
                    <Header/>
                    <TabBar
                        routes={TAB_ROUTES}
                        currentIndex={index}
                    />
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

});
