import React, {useState, useEffect} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Image,
    TextInput,
    Modal,
    ActivityIndicator,
    SafeAreaView,
    StatusBar,
    Dimensions,
    RefreshControl,
    Platform,
    ScrollView
} from 'react-native';
import useAuthViewModel from '../viewModels/AuthViewModel';

// Import logo image directly
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import {Carousel} from 'react-native-auto-carousel';

const {width} = Dimensions.get('window');
const THUMBNAIL_WIDTH = width / 3 - 16; // Full width with padding
const THUMBNAIL_HEIGHT = THUMBNAIL_WIDTH * 9 / 16; // 16:9 aspect ratio

interface CarouselItem {
    type: 'movie' | 'tvSeries';
    image: string;
    id: number;
}

export default function HomeScreen({navigation}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [mockVideosData, setMockVideosData] = useState([]);
    const [filteredVideos, setFilteredVideos] = useState([]);
    const [isLoadingMockData, setIsLoadingMockData] = useState(true);
    const [mockError, setMockError] = useState(null);
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        {key: 'home', title: '推荐'},
        {key: 'movies', title: '电影'},
        {key: 'tvSeries', title: '电视剧'},
        {key: 'tvShows', title: '综艺'},
        {key: 'record', title: '记录'},
    ]);
    const carouselData: CarouselItem[] = [
        {image: 'https://picsum.photos/800/400?random=1', id: 1, type: 'movie'},
        {image: 'https://picsum.photos/800/400?random=2', id: 2, type: 'movie'},
    ];
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

    // Load the mock videos directly from VideoService
    const loadMockVideos = async () => {
        try {
            console.log("load mock videos")
            setIsLoadingMockData(true);
            setMockError(null);

            // Import the mock data directly to avoid network requests
            const mockVideos = [
                {
                    id: '1',
                    title: 'Big Buck Bunny',
                    description: 'Big Buck Bunny tells the story of a giant rabbit with a heart bigger than himself.',
                    thumbnail: 'https://peach.blender.org/wp-content/uploads/title_anouncement.jpg',
                    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
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
                        episode: 1,
                        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                    }, {
                        episode: 2,
                        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                    }, {
                        episode: 3,
                        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                    }],

                },
                {
                    id: '2',
                    title: 'Elephant Dream',
                    description: 'The first Blender Open Movie from 2006',
                    thumbnail: 'https://peach.blender.org/wp-content/uploads/title_anouncement.jpg',
                    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                    duration: '10:54',
                    views: 8362,
                    likes: 687,
                    categories: ['Animation', 'Fantasy'],
                    author: {
                        name: 'Blender Foundation',
                        avatar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Blender_logo_no_text.svg/1200px-Blender_logo_no_text.svg.png'
                    },
                    isFavorite: false,
                    rating: 4.6,
                    publishDate: '2006-08-15'
                },
                {
                    id: '3',
                    title: 'Sintel',
                    description: 'Sintel is a fantasy computer animated short movie made by the Blender Institute.',
                    thumbnail: 'https://peach.blender.org/wp-content/uploads/title_anouncement.jpg',
                    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
                    duration: '14:48',
                    views: 12893,
                    likes: 1093,
                    categories: ['Animation', 'Fantasy', 'Action'],
                    author: {
                        name: 'Blender Foundation',
                        avatar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Blender_logo_no_text.svg/1200px-Blender_logo_no_text.svg.png'
                    },
                    isFavorite: false,
                    rating: 4.9,
                    publishDate: '2010-09-30'
                }
            ];

            // Add some extra variety by creating copies with different IDs
            const extraVideos = mockVideos.map(video => ({
                ...video,
                id: 'extra-' + video.id + Math.random(),
                isFavorite: Math.random() > 0.5,
                views: Math.floor(video.views * (0.5 + Math.random()))
            }));

            // Combine original and extra videos
            setMockVideosData([...mockVideosData, ...extraVideos]);
            console.log(`Loaded ${mockVideosData.length} mock videos successfully`);

        } catch (error) {
            console.error('Error loading mock videos:', error);
            setMockError('Failed to load videos. Please try again.');
        } finally {
            setIsLoadingMockData(false);
        }
    };

    // Derived state using only local variables
    const isLoading = isLoadingMockData;
    const error = mockError;
    const videos = searchQuery ? filteredVideos : mockVideosData;

    useEffect(() => {
        // Log any issues occurring during initialization
        try {
            console.log('Initializing HomeScreen with mock data...');
            // Load mock videos directly
            loadMockVideos();
        } catch (err) {
            console.error('Error in HomeScreen initialization:', err);
            setMockError('Failed to initialize the screen. Please restart the app.');
        }
    }, []);

    const handleSearch = () => {
        if (searchQuery.trim()) {
            try {
                setIsLoadingMockData(true);

                // Filter the videos locally based on search query
                const filtered = mockVideosData.filter(video =>
                    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (video.author?.name && video.author.name.toLowerCase().includes(searchQuery.toLowerCase()))
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

    const handleSearchInputChange = (text) => {
        setSearchQuery(text);
        if (!text) {
            setFilteredVideos([]);
        }
    };

    const navigateToProfile = () => {
        navigation.navigate('Profile');
    };

    const navigateToVideoDetails = (video) => {
        console.log('Navigating to video player with video:', video.title);
        navigation.navigate('VideoPlayer', {video});
    };

    const handleRefresh = () => {
        loadMockVideos();
    };

    const loadMoreVideos = () => {
        // loadMockVideos();
        console.log('Load More Videos');
    };

    const handleToggleFavorite = (videoId) => {
        // Update the mock videos data to toggle favorite
        setMockVideosData(prevVideos =>
            prevVideos.map(video =>
                video.id === videoId
                    ? {...video, isFavorite: !video.isFavorite}
                    : video
            )
        );
    };

    const renderVideoItem = ({item}) => (
        <TouchableOpacity
            style={styles.videoItem}
            onPress={() => navigateToVideoDetails(item)}
        >
            <View style={styles.thumbnailContainer}>
                <Image
                    source={{uri: item.thumbnail}}
                    style={styles.thumbnail}
                    resizeMode="cover"
                />
                <View style={styles.durationContainer}>
                    <Text style={styles.durationText}>{item.duration}</Text>
                </View>
                <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => handleToggleFavorite(item.id)}
                >
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
        </TouchableOpacity>
    );

    const renderScene = SceneMap({
        home: () => (
            <View style={styles.container}>
                <View style={{flex: 0.3}}>
                    <Carousel
                        data={carouselData}
                        dotStyle={{
                            width: 10,
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: '#FFFFFF'
                        }}
                        autoPlay={true}
                        autoPlayTime={2000}
                        renderItem={(item: CarouselItem) => (
                            <Image
                                key={item.id}
                                source={{uri: item.image}}
                                style={{
                                    height: 200,
                                    width: Dimensions.get('window').width
                                }}
                            />
                        )}
                    />
                </View>
                <View style={{flex: 0.7}}>
                    <FlatList
                        data={videos}
                        renderItem={renderVideoItem}
                        keyExtractor={(item) => item.id.toString()}
                        numColumns={5}
                        contentContainerStyle={[styles.videoList, {minHeight: Dimensions.get('window').height}]}
                        showsVerticalScrollIndicator={true}
                        refreshControl={
                            <RefreshControl
                                refreshing={isLoadingMockData && videos.length > 0}
                                onRefresh={handleRefresh}
                                colors={['#f44336']}
                                tintColor="#f44336"
                            />
                        }
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>
                                {searchQuery ? 'No videos match your search' : 'No videos available'}
                            </Text>
                        }
                        onEndReached={loadMoreVideos}
                        onEndReachedThreshold={0.01}
                    />
                </View>
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
                <FlatList
                    data={videos}
                    renderItem={renderVideoItem}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={5}
                    contentContainerStyle={[styles.videoList, {minHeight: Dimensions.get('window').height}]}
                    showsVerticalScrollIndicator={true}
                    refreshControl={
                        <RefreshControl
                            refreshing={isLoadingMockData && videos.length > 0}
                            onRefresh={handleRefresh}
                            colors={['#f44336']}
                            tintColor="#f44336"
                        />
                    }
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>
                            {searchQuery ? 'No videos match your search' : 'No videos available'}
                        </Text>
                    }
                    onEndReached={loadMoreVideos}
                    onEndReachedThreshold={0.01}
                />
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
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff"/>

            {/* Header */}
            <View style={styles.header}>
                <Image
                    source={require('../../assets/icon.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />

                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search videos..."
                        value={searchQuery}
                        onChangeText={handleSearchInputChange}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                    <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                        <Text style={styles.searchButtonText}>🔍</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={navigateToProfile} style={styles.menuButton}>
                    <Text style={styles.menuIcon}>☰</Text>
                </TouchableOpacity>
            </View>

            <TabView
                navigationState={{index, routes}}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{width: Dimensions.get('window').width}}
            />

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',  // 改为浅灰色背景
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#fff',  // 纯白背景
        elevation: 0,  // 移除阴影
        borderBottomWidth: 0,  // 移除底部边框
    },
    logo: {
        width: 40,
        height: 40,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        marginHorizontal: 10,
        height: 40,
        borderRadius: 8,  // 改为小圆角
        backgroundColor: '#f0f0f0',  // 更浅的背景色
        borderWidth: 0,  // 移除边框
    },
    searchInput: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 12,
        fontSize: 14,
        color: '#333',  // 深色文字
    },
    searchButton: {
        width: 40,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchButtonText: {
        fontSize: 16,
    },
    menuButton: {
        padding: 5,
    },
    menuIcon: {
        fontSize: 24,
    },
    thumbnailContainer: {
        position: 'relative',
        width: '100%',
        aspectRatio: 1,
    },
    thumbnail: {
        width: '100%',
        height: '100%',  // 填满容器
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        backgroundColor: '#e0e0e0',
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
        padding: 8,  // 减小内边距
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
    videoItem: {
        width: '19%',
        margin: 5,
        backgroundColor: '#fff',
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 0.5,
        borderColor: '#e0e0e0',
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
});
