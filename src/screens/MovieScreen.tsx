import React, {useEffect, useState} from 'react';
import {SafeAreaView, StyleSheet, View} from 'react-native';
import {Button} from "../components/Button";
import {BottomArrow, TopArrow} from "../components/Arrows";
import {SpatialNavigationScrollView, SpatialNavigationView} from "react-tv-space-navigation";
import {scaledPixels} from "../hooks/useScale";
import {Page} from "../components/Page";
import {theme} from "../theme/theme";
import chunk from 'lodash/chunk';
import VideoItem from "../models/VideoItem";
import {GENRE_OPTIONS, REGION_OPTIONS, SORT_OPTIONS, TAB_ROUTES, YEAR_OPTIONS} from "../utils/ApiConstants";
import {Header} from "../components/Header";
import {TabBar} from "../components/Tabbar";
import {VideoList} from "../components/VideoList";
import {UpdateProvider} from "../components/UpdateContext";
import {Spacer} from "../components/Spacer";

const HEADER_SIZE = scaledPixels(400)
export default function MovieScreen({route, navigation}) {
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [videosByRow, setVideosByRow] = useState<VideoItem[][]>([]);
    const [isLoadingMockData, setIsLoadingMockData] = useState(true);
    const [mockError, setMockError] = useState(null);
    const [index, setIndex] = useState(1);

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

                }, {
                    id: 3,
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
                    id: 4,
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
                    id: 5,
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
                    id: 6,
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
                    id: 7,
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
                    id: 8,
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
                    id: 9,
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
                    id: 10,
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
        <UpdateProvider>
            <Page>
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
                        <SpatialNavigationView style={styles.filterRow} direction="horizontal">
                            {SORT_OPTIONS.map((option, key) => (
                                <React.Fragment key={key}>
                                    <Spacer direction="horizontal" gap={'$4'}/>
                                    <Button label={option} onSelect={() => console.log("sort onSelect")}/>
                                </React.Fragment>
                            ))}
                        </SpatialNavigationView>
                        <SpatialNavigationView style={styles.filterRow} direction="horizontal">
                            {GENRE_OPTIONS.map((option, key) => (
                                <React.Fragment key={key}>
                                    <Spacer direction="horizontal" gap={'$4'}/>
                                    <Button label={option} onSelect={() => console.log("sort onSelect")}/>
                                </React.Fragment>
                            ))}
                        </SpatialNavigationView>
                        <SpatialNavigationView style={styles.filterRow} direction="horizontal">
                            {REGION_OPTIONS.map((option, key) => (
                                <React.Fragment key={key}>
                                    <Spacer direction="horizontal" gap={'$4'}/>
                                    <Button label={option} onSelect={() => console.log("sort onSelect")}/>
                                </React.Fragment>
                            ))}
                        </SpatialNavigationView>
                        <SpatialNavigationView style={styles.filterRow} direction="horizontal">
                            {YEAR_OPTIONS.map((option, key) => (
                                <React.Fragment key={key}>
                                    <Spacer direction="horizontal" gap={'$4'}/>
                                    <Button label={option} onSelect={() => console.log("sort onSelect")}/>
                                </React.Fragment>
                            ))}
                        </SpatialNavigationView>

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
        backgroundColor: '#111111',
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
