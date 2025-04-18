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
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import {Carousel} from 'react-native-auto-carousel';
import {Button} from "../components/Button";
import {TextInput} from "../components/TextInput";
import {BottomArrow, LeftArrow, RightArrow, TopArrow} from "../components/Arrows";
import {
    DefaultFocus,
    SpatialNavigationFocusableView,
    SpatialNavigationNode,
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

const {width} = Dimensions.get('window');
const THUMBNAIL_WIDTH = width / 3 - 16; // Full width with padding
const THUMBNAIL_HEIGHT = THUMBNAIL_WIDTH * 9 / 16; // 16:9 aspect ratio

interface CarouselItem {
    type: 'movie' | 'tvSeries';
    image: string;
    id: number;
}

const HEADER_SIZE = scaledPixels(400)
export default function HomeScreen({navigation}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [videosByRow, setVideosByRow] = useState<VideoItem[][]>([]);
    const [filteredVideos, setFilteredVideos] = useState<VideoItem[]>([]);
    const [isLoadingMockData, setIsLoadingMockData] = useState(true);
    const [mockError, setMockError] = useState(null);
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        {key: 'history', title: '播放历史'},
        {key: 'movies', title: '电影'},
        {key: 'tvSeries', title: '电视剧'},
        {key: 'tvShows', title: '综艺'},
        {key: 'record', title: '记录'},
    ]);
    const renderTabBar = (props) => {
        return (
            <SpatialNavigationView style={styles.tabBarContainer} direction="horizontal">
                {props.navigationState.routes.map((route, i) => (
                    <SpatialNavigationFocusableView
                        key={route.key}
                        style={{flex: 1}}
                        onSelect={() => {
                            setIndex(i);
                            console.log(`Selected tab: ${route.title}`);
                        }}
                    >
                        {({isFocused, isRootActive}) => (
                            <View style={[
                                styles.tabItem,
                                isFocused && isRootActive && styles.activeTabItem
                            ]}>
                                <Animated.Text style={[
                                    styles.tabText,
                                    isFocused && isRootActive && styles.activeTabText
                                ]}>
                                    {route.title}
                                </Animated.Text>
                            </View>
                        )}
                    </SpatialNavigationFocusableView>
                ))}
            </SpatialNavigationView>
        );
    };
    const [sortOptions, setSortOptions] = useState([]); // 最新、最热、好评
    const [genreOptions, setGenreOptions] = useState([]); // 爱情、古装、悬疑、都市、喜剧
    const [regionOptions, setRegionOptions] = useState([]); // 大陆、香港、台湾、日本、韩国、美国
    const [yearOptions, setYearOptions] = useState([]);// 2025、2024、2023、2022、2021、2020、2019、2018、2017、2016

    const [historyDataSource, setHistoryDataSource] = useState([]);
    const [historyCurrentPage, setHistoryCurrentPage] = useState(1);
    const pageSize = 10;

    const handleSortOptionPress = (option) => {
        setSortOptions(prevOptions => {
            if (prevOptions.includes(option)) {
                return prevOptions.filter(opt => opt !== option);
            } else {
                return [...prevOptions, option];
            }
        });
        // 调用查询接口
        queryVideos();
    };

    const handleGenreOptionPress = (option) => {
        setGenreOptions(prevOptions => {
            if (prevOptions.includes(option)) {
                return prevOptions.filter(opt => opt !== option);
            } else {
                return [...prevOptions, option];
            }
        });
        // 调用查询接口
        queryVideos();
    };

    const handleRegionOptionPress = (option) => {
        setRegionOptions(prevOptions => {
            if (prevOptions.includes(option)) {
                return prevOptions.filter(opt => opt !== option);
            } else {
                return [...prevOptions, option];
            }
        });
        // 调用查询接口
        queryVideos();
    };

    const handleYearOptionPress = (option) => {
        setYearOptions(prevOptions => {
            if (prevOptions.includes(option)) {
                return prevOptions.filter(opt => opt !== option);
            } else {
                return [...prevOptions, option];
            }
        });
        // 调用查询接口
        queryVideos();
    };

    const queryVideos = () => {
        // 这里模拟发送请求，实际使用时需要替换为真实的接口调用
        const allOptions = {
            sort: sortOptions,
            genre: genreOptions,
            region: regionOptions,
            year: yearOptions
        };
        console.log('Sending query with options:', allOptions);
        // 假设这里有一个函数 sendQuery 来发送请求
        // sendQuery(allOptions).then(response => {
        //   setMockVideosData(response.data);
        // });
    };

    const {logout} = useAuthViewModel();

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

    const handleSearch = () => {
        if (searchQuery.trim()) {
            try {
                setIsLoadingMockData(true);

                // Filter the videos locally based on search query
                const filtered = videos.filter(video =>
                    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    video.description.toLowerCase().includes(searchQuery.toLowerCase())
                );

                // Set filtered videos
                setFilteredVideos(filtered);

                // Log results
                if (filtered.length === 0) {
                    console.log('No videos match the search query');
                } else {
                    console.log(`Found ${filtered.length} videos matching "${searchQuery}"`);
                }
            } catch (error) {
                console.error('Search error:', error);
                setMockError('Failed to search videos. Please try again.');
            } finally {
                setIsLoadingMockData(false);
            }
        } else {
            // Clear filtered videos when search is cleared
            setFilteredVideos([]);
        }
    };

    const navigateToVideoDetails = (video) => {
        console.log('Navigating to video detail with video:', video.title);
        navigation.navigate('VideoDetail', {video});
    };

    const loadMoreVideos = () => {
        // loadMockVideos();
        console.log('Load More Videos');
    };

    const renderVideoItem = ({item}: { item: VideoItem }) => (
        <SpatialNavigationFocusableView onSelect={() => {
            navigateToVideoDetails(item)
        }} key={item.id}>
            {({isFocused, isRootActive}) => (
                <View style={{
                    width: scaledPixels(382),
                    borderWidth: 2,
                    borderRadius: 4,
                    backgroundColor: '#fff',
                    borderColor: isFocused && isRootActive ? 'white' : 'black',
                    overflow: 'hidden',
                }}>
                    <View style={styles.thumbnailContainer}>
                        <Image
                            source={{uri: item.thumbnail}}
                            style={styles.thumbnail}
                            resizeMode="stretch"
                        />
                        <TouchableOpacity style={styles.favoriteButton}>
                            <Text style={styles.favoriteIcon}>{item.isFavorite ? '★' : '☆'}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.videoDetails}>
                        <View style={styles.videoTextContent}>
                            <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>
                            <Text style={styles.videoSubtitle} numberOfLines={1}>
                                {item.actors?.join(',')}
                            </Text>
                            <Text style={styles.videoInfo} numberOfLines={1}>
                                {item.views} views • {item.publishDate || 'Unknown date'}
                            </Text>
                        </View>
                    </View>
                </View>
            )}
        </SpatialNavigationFocusableView>
    );

    const renderVideosByRow = (videos: VideoItem[], index: number) => (
        <SpatialNavigationView style={{height: scaledPixels(520), width: '100%'}} direction="horizontal" key={index}>
            {videos.map((item) => {
                return renderVideoItem({item})
            })}
        </SpatialNavigationView>
    );

    const renderScene = SceneMap({
        history: () => (
            <View style={styles.container}>
                <SpatialNavigationScrollView>
                    <View style={{flexDirection: 'row'}}>
                        <SpatialNavigationView alignInGrid direction="vertical">
                            <DefaultFocus>{videosByRow.map(renderVideosByRow)}</DefaultFocus>
                        </SpatialNavigationView>
                    </View>
                </SpatialNavigationScrollView>
            </View>
        ),
        movies: () => (
            <View style={{flex: 1}}>
                <View style={styles.filterContainer}>
                    <ScrollView horizontal style={styles.filterRow}>
                        {['最新', '最热', '好评'].map(option => (
                            <TouchableOpacity
                                key={option}
                                style={[
                                    styles.filterOption,
                                    sortOptions.includes(option) && styles.selectedFilterOption
                                ]}
                                onPress={() => handleSortOptionPress(option)}
                            >
                                <Text style={styles.filterText}>{option}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    {/* 第二行：爱情、古装、悬疑、都市、喜剧 */}
                    <ScrollView horizontal style={styles.filterRow}>
                        {['爱情', '古装', '悬疑', '都市', '喜剧'].map(option => (
                            <TouchableOpacity
                                key={option}
                                style={[
                                    styles.filterOption,
                                    genreOptions.includes(option) && styles.selectedFilterOption
                                ]}
                                onPress={() => handleGenreOptionPress(option)}
                            >
                                <Text style={styles.filterText}>{option}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    {/* 第三行：大陆、香港、台湾、日本、韩国、美国 */}
                    <ScrollView horizontal style={styles.filterRow}>
                        {['大陆', '香港', '台湾', '日本', '韩国', '美国'].map(option => (
                            <TouchableOpacity
                                key={option}
                                style={[
                                    styles.filterOption,
                                    regionOptions.includes(option) && styles.selectedFilterOption
                                ]}
                                onPress={() => handleRegionOptionPress(option)}
                            >
                                <Text style={styles.filterText}>{option}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    {/* 第四行：2025、2024、2023、2022、2021、2020、2019、2018、2017、2016 */}
                    <ScrollView horizontal style={styles.filterRow}>
                        {['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016'].map(option => (
                            <TouchableOpacity
                                key={option}
                                style={[
                                    styles.filterOption,
                                    yearOptions.includes(option) && styles.selectedFilterOption
                                ]}
                                onPress={() => handleYearOptionPress(option)}
                            >
                                <Text style={styles.filterText}>{option}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        ),
        tvSeries: () => (
            <View></View>
        ),
        tvShows: () => (
            <View></View>
        ),
        cartoon: () => (
            <View></View>

        ),
        record: () => (
            <View></View>

        ),
    });

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
                    <SpatialNavigationNode orientation={'horizontal'}>
                        <Container height={scaledPixels(150)}>
                            <View style={styles.header}>
                                <Image
                                    source={require('../../assets/icon.png')}
                                    style={styles.logo}
                                    resizeMode="cover"
                                />
                                <View style={styles.searchContainer}>
                                    <TextInput placeholder='搜索'/>
                                </View>
                                <Button label="更新" onSelect={() => console.log('更新!')}/>
                                <Spacer direction={"horizontal"} gap={'$6'}/>
                                <Button label="登录" onSelect={() => console.log('登录!')}/>
                                <Spacer direction={"horizontal"} gap={'$6'}/>
                                <Button label="赞赏" onSelect={() => console.log('赞赏!')}/>
                                <Spacer direction={"horizontal"} gap={'$6'}/>
                                <Button label="收藏" onSelect={() => console.log('收藏!')}/>
                            </View>

                        </Container>
                    </SpatialNavigationNode>
                    <SpatialNavigationNode orientation={'vertical'}>
                        <Container height={scaledPixels(1000)}>
                            <TabView
                                navigationState={{index, routes}}
                                renderScene={renderScene}
                                renderTabBar={renderTabBar}
                                onIndexChange={setIndex}
                                initialLayout={{width: Dimensions.get('window').width}}
                            />
                        </Container>
                    </SpatialNavigationNode>
                </SpatialNavigationScrollView>
            </SafeAreaView>
        </Page>
    );
}

const Container = styled.View<{ height: number }>(({height}) => ({
    height: height,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacings.$1,
    width: '100%',
}));

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
