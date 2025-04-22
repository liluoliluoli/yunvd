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

const HEADER_SIZE = scaledPixels(400)
export default function SearchScreen({route, navigation}) {
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [videosByRow, setVideosByRow] = useState<VideoItem[][]>([]);
    const [isLoadingMockData, setIsLoadingMockData] = useState(true);
    const [mockError, setMockError] = useState(null);
    const [keywordText, setKeywordText] = useState(route.params.keyword);


    const loadVideos = async () => {
        try {
            setIsLoadingMockData(true);
            setMockError(null);
            const mockVideos: VideoItem[] = [
                {
                    id: 1,
                    title: 'Big Buck Bunny',
                    description: 'Big Buck Bunny tells the story of a giant rabbit with a heart bigger than himself.',
                    thumbnail: 'https://peach.blender.org/wp-content/uploads/title_anouncement.jpg',
                    duration: '9:56',
                    views: 10482,
                    likes: 849,
                    directors: ['Blender Foundation'],
                    actors: ['Blender', 'Foundation', 'ket', 'Blender', 'Foundation', 'ket'],
                    genres: ['喜剧', '动作'],
                    region: 'US',
                    year: '2025',
                    isFavorite: false,
                    rating: 4.8,
                    publishDate: '2008-05-20',
                    episodeCount: 20,
                    episodes: [{
                        id: 1,
                        episode: "第1集",
                        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                    }, {
                        id: 2,
                        episode: "第2集",
                        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                    }],

                }, {
                    id: 2,
                    title: 'Big Buck Bunny',
                    description: 'Big Buck Bunny tells the story of a giant rabbit with a heart bigger than himself.',
                    thumbnail: 'https://peach.blender.org/wp-content/uploads/title_anouncement.jpg',
                    duration: '9:56',
                    views: 10482,
                    likes: 849,
                    directors: ['Blender Foundation'],
                    actors: ['Blender', 'Foundation', 'ket', 'Blender', 'Foundation', 'ket'],
                    genres: ['喜剧', '动作'],
                    region: 'US',
                    year: '2025',
                    isFavorite: false,
                    rating: 4.8,
                    publishDate: '2008-05-20',
                    episodeCount: 20,
                    episodes: [{
                        id: 1,
                        episode: "第1集",
                        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                    }, {
                        id: 2,
                        episode: "第2集",
                        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                    }],
                }
            ];
            setVideos([...videos, ...mockVideos]);
        } catch (error) {
            console.error('Error loading videos:', error);
            setMockError('Failed to load videos. Please try again.');
        } finally {
            setIsLoadingMockData(false);
        }
    };

    useEffect(() => {
        try {
            loadVideos();
        } catch (err) {
            setMockError('Failed to initialize the screen. Please restart the app.');
        }
    }, []);

    useEffect(() => {
        setVideosByRow(chunk(videos, 5));
        console.log(`Loaded ${videos.length} videos successfully`);
    }, [videos]);

    useEffect(() => {
        console.log(`Loaded ${videosByRow.length} videosByRow successfully`);
    }, [videosByRow]);

    const navigateToVideoDetails = (video) => {
        console.log('Navigating to video detail with video:', video.title);
        navigation.navigate('VideoDetail', {video});
    };

    return (
        <Page>
            <SafeAreaView style={styles.container}>
                <SpatialNavigationScrollView
                    offsetFromStart={HEADER_SIZE + 20}
                    descendingArrow={<TopArrow/>}
                    ascendingArrow={<BottomArrow/>}
                    descendingArrowContainerStyle={styles.topArrowContainer}
                    ascendingArrowContainerStyle={styles.bottomArrowContainer}
                >
                    <View style={styles.searchHeader}>
                        <Text style={styles.searchKeyword}>{keywordText}</Text>
                        <View style={styles.divider}/>
                    </View>
                    <VideoList
                        videosByRow={videosByRow}
                        onVideoPress={navigateToVideoDetails}
                    />

                </SpatialNavigationScrollView>
            </SafeAreaView>
        </Page>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111111',
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
    searchHeader: {
        paddingHorizontal: theme.spacings.$4,
        marginBottom: theme.spacings.$4,
    },
    searchKeyword: {
        color: 'white',
        fontSize: 16,
        marginBottom: theme.spacings.$2,
    },
    divider: {
        height: 1,
        backgroundColor: 'white',
        width: '100%',
    },
});
