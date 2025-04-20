import React, {useState, useEffect} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Image,
    Modal,
    ActivityIndicator,
    SafeAreaView,
    StatusBar,
    Dimensions,
    RefreshControl,
    Platform,
    ScrollView,
    Animated
} from 'react-native';
import useAuthViewModel from '../viewModels/AuthViewModel';

// Import logo image directly
import {Carousel} from 'react-native-auto-carousel';
import {Button} from "../components/Button";
import {TextInput} from "../components/TextInput";
import {BottomArrow, LeftArrow, RightArrow, TopArrow} from "../components/Arrows";
import {
    DefaultFocus,
    SpatialNavigationFocusableView,
    SpatialNavigationNode, SpatialNavigationRoot,
    SpatialNavigationScrollView, SpatialNavigationView, SpatialNavigationVirtualizedList
} from "react-tv-space-navigation";
import {scaledPixels} from "../hooks/useScale";
import {Page} from "../components/Page";
import {Spacer} from "../components/Spacer";
import styled from "@emotion/native";
import {theme} from "../theme/theme";
import {Box} from "../components/Box";
import chunk from 'lodash/chunk';
import VideoItem from "../models/VideoItem";
import {SORT_OPTIONS, TAB_ROUTES} from "../utils/ApiConstants";
import {Header} from "../components/Header";
import {TabBar} from "../components/Tabbar";
import {VideoList} from "../components/VideoList";

const HEADER_SIZE = scaledPixels(400)
export default function MovieScreen({navigation}) {
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [videosByRow, setVideosByRow] = useState<VideoItem[][]>([]);
    const [isLoadingMockData, setIsLoadingMockData] = useState(true);
    const [mockError, setMockError] = useState(null);
    const [index, setIndex] = useState(1);
    const loadVideos = async () => {
        try {
            console.log("load videos")
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
            console.log('Initializing HomeScreen with mock data...');
            loadVideos();
        } catch (err) {
            console.error('Error in HomeScreen initialization:', err);
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
                    <Header
                        onSearch={() => console.log("search")}
                        onUpdate={() => console.log('更新!')}
                        onLogin={() => console.log('登录!')}
                        onDonate={() => console.log('赞赏!')}
                        onFavorite={() => console.log('收藏!')}
                    />
                    <TabBar
                        routes={TAB_ROUTES}
                        currentIndex={index}
                        onTabPress={(i) => {
                            navigation.navigate(TAB_ROUTES[i].screen);
                        }}
                    />
                    <SpatialNavigationView style={styles.filterRow} direction="horizontal">
                        {SORT_OPTIONS.map(option => (
                            <Button label={option} key={option} onSelect={() => console.log("sort onSelect")}/>
                        ))}
                    </SpatialNavigationView>
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
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: 'gray',
        width: '100%',
    },
    logo: {
        width: 40,
        height: 40,
    },
    searchContainer: {
        width: scaledPixels(500),
        flexDirection: 'row',
        marginHorizontal: 10,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        borderWidth: 0,
    },
    thumbnailContainer: {
        height: scaledPixels(380),
        width: '100%',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    durationContainer: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 4,
    },
    durationText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '500',
    },
    favoriteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    favoriteIcon: {
        color: 'gold',
        fontSize: 18,
        marginBottom: 4,
    },
    videoDetails: {
        flexDirection: 'row',
        padding: 6,  // 减小内边距
        alignItems: 'flex-start',
    },
    videoTextContent: {
        flex: 1,
        flexShrink: 1,  // 允许缩小
    },
    videoTitle: {
        fontSize: 14,  // 减小字体
        fontWeight: '500',
        color: '#333',
        marginBottom: 2,  // 减小间距
        lineHeight: 16,  // 添加行高
    },
    videoSubtitle: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    videoInfo: {
        fontSize: 10,  // 减小字体
        color: '#888',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: '#f44336',
        marginBottom: 15,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#f44336',
        padding: 10,
        borderRadius: 5,
    },
    retryButtonText: {
        color: 'white',
        fontWeight: '600',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#666',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
    },
    menuContainer: {
        width: 200,
        backgroundColor: 'white',
        marginTop: 60,
        marginRight: 10,
        borderRadius: 5,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    menuItem: {
        padding: 15,
    },
    menuItemText: {
        fontSize: 16,
        color: '#333',
    },
    menuDivider: {
        height: 1,
        backgroundColor: '#e0e0e0',
    },
    tabBar: {
        backgroundColor: '#fff',
        elevation: 0,
        borderBottomWidth: 0.5,
        borderBottomColor: '#e0e0e0',
    },
    tabLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',  // 灰色文字
    },
    tabIndicator: {
        backgroundColor: '#f44336',
        height: 3,  // 加粗指示器
    },
    videoList: {
        padding: 8,  // 减小内边距
        flexGrow: 1,
    },
    filterContainer: {
        padding: 6,  // 减少内边距
        backgroundColor: '#fff',
        borderBottomWidth: 0.5,
        borderBottomColor: '#e0e0e0',
    },
    filterRow: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        marginBottom: 4,  // 减少行间距
        overflow: 'scroll'
    },
    filterOption: {
        padding: 3,  // 减少内边距
        margin: 2,  // 减少外边距
        borderWidth: 1,
        borderRadius: 4,  // 减小圆角
        backgroundColor: '#f0f0f0',
    },
    selectedFilterOption: {
        backgroundColor: '#f44336',
        borderWidth: 0,
    },
    filterText: {
        fontSize: 12,  // 减小字体大小
        color: '#000',
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
    }, tabBarContainer: {
        flexDirection: 'row',
        height: scaledPixels(100),
        backgroundColor: '#1a1a1a',
        paddingHorizontal: 10,
    },
    tabItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        marginHorizontal: 5,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTabItem: {
        borderBottomColor: 'green',
    },
    tabText: {
        color: '#888',
        fontSize: 16,
        fontWeight: '500',
    },
    activeTabText: {
        color: '#fff',
    },
});
