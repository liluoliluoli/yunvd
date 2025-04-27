import React, {useEffect, useState} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {BottomArrow, TopArrow} from "../components/Arrows";
import {SpatialNavigationScrollView} from "react-tv-space-navigation";
import {scaledPixels} from "../hooks/useScale";
import {Page} from "../components/Page";
import {theme} from "../theme/theme";
import chunk from 'lodash/chunk';
import VideoItem from "../models/VideoItem";
import {HEADER_SIZE, TAB_ROUTES} from "../utils/ApiConstants";
import {Header} from "../components/Header";
import {TabBar} from "../components/Tabbar";
import {VideoList} from "../components/VideoList";
import {UpdateProvider} from "../components/UpdateContext";
import {useVideoViewModel} from '../viewModels/VideoViewModel';


export default function HomeScreen({route, navigation}) {
    const [videosByRow, setVideosByRow] = useState<VideoItem[][]>([]);
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
        genre,
        region,
        year,
        videoType,
        setIsHistory,
        fetchSearchVideos,
    } = useVideoViewModel();

    useEffect(() => {
        console.log(`videos total ${videos.length}`);
        setVideosByRow(chunk(videos, 5));
    }, [videos]);

    useEffect(() => {
        if (down) {
            setDown(false)
            fetchSearchVideos()
        }
    }, [down]);

    useEffect(() => {
        setIsHistory(true);
        fetchSearchVideos()
    }, []);

    const navigateToVideoDetails = (video) => {
        console.log('Navigating to video detail with video:', video.title);
        navigation.push('VideoDetail', {video});
    };


    return (
        <UpdateProvider>
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
                            onTabPress={(index: number) => {
                                navigation.navigate(TAB_ROUTES[index].screen);
                            }}
                        />
                        <VideoList
                            videosByRow={videosByRow}
                            onVideoPress={navigateToVideoDetails}
                        />

                    </SpatialNavigationScrollView>
                </SafeAreaView>
            </Page>
        </UpdateProvider>
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
