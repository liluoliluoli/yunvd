import React, {useEffect, useState} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {BottomArrow, TopArrow} from "../components/Arrows";
import {SpatialNavigationScrollView} from "react-tv-space-navigation";
import {scaledPixels} from "../hooks/useScale";
import {Page} from "../components/Page";
import {theme} from "../theme/theme";
import chunk from 'lodash/chunk';
import Video from "../models/Video";
import {HEADER_SIZE, REGION_OPTIONS, SORT_OPTIONS, VT_TV_SHOWS, YEAR_OPTIONS} from "../utils/ApiConstants";
import {VideoList} from "../components/VideoList";
import {useVideoListViewModel} from "../viewModels/VideoListViewModel";
import {FilterBar} from "../components/Filterbar";
import LoadingIndicator from "../components/LoadingIndicator";

export default function TvShowScreen({route, navigation}) {
    const [videosByRow, setVideosByRow] = useState<Video[][]>([]);
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
    } = useVideoListViewModel();

    useEffect(() => {
        console.log(`videos total ${videos.length}`);
        setVideosByRow(chunk(videos, 5));
    }, [videos]);

    useEffect(() => {
        if (down) {
            setDown(false)
            setCurrentPage(prev => prev + 1);
        }
    }, [down]);

    useEffect(() => {
        setIsRefresh(true);
        setCurrentPage(0);
    }, [sort, genre, region, year]);

    useEffect(() => {
        setCurrentPage(1);
    }, [isRefresh]);

    useEffect(() => {
        if (videoType && currentPage !== 0) {
            fetchSearchVideos()
        }
    }, [currentPage]);

    useEffect(() => {
        setVideoType(VT_TV_SHOWS)
        if (videoType) {
            setIsHistory(false);
            setCurrentPage(1);
        }
    }, [videoType]);

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
                    <FilterBar routes={SORT_OPTIONS}
                               onTabPress={(index: number) => setSort(SORT_OPTIONS[index].key)}
                               currentIndex={0}></FilterBar>
                    <FilterBar routes={REGION_OPTIONS}
                               onTabPress={(index: number) => setRegion(REGION_OPTIONS[index].key)}
                               currentIndex={0}></FilterBar>
                    <FilterBar routes={YEAR_OPTIONS}
                               onTabPress={(index: number) => setYear(YEAR_OPTIONS[index].key)}
                               currentIndex={0}></FilterBar>
                    <VideoList
                        isHistory={false}
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
        paddingLeft: 2,
        paddingRight: 2
    },
    filterRow: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        marginBottom: 1,
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
});
