import React, { useState, useEffect } from 'react';
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
  Platform
} from 'react-native';
import useAuthViewModel from '../viewModels/AuthViewModel';

// Import logo image directly
import LogoImage from '../../assets/icon.png';

const { width } = Dimensions.get('window');
const THUMBNAIL_WIDTH = width - 24; // Full width with padding
const THUMBNAIL_HEIGHT = THUMBNAIL_WIDTH * 0.56; // 16:9 aspect ratio

export default function HomeScreen({ navigation }) {
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mockVideosData, setMockVideosData] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [isLoadingMockData, setIsLoadingMockData] = useState(true);
  const [mockError, setMockError] = useState(null);

  const { logout } = useAuthViewModel();

  // Load the mock videos directly from VideoService
  const loadMockVideos = async () => {
    try {
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
          categories: ['Animation', 'Short'],
          author: {
            name: 'Blender Foundation',
            avatar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Blender_logo_no_text.svg/1200px-Blender_logo_no_text.svg.png'
          },
          isFavorite: false,
          rating: 4.8,
          publishDate: '2008-05-20',
          episodeCount:20,
          episodes: [{
            episode:1,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          },{
            episode:2,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          },{
            episode:3,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          },{
            episode:1,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          },{
            episode:2,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          },{
            episode:3,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          },{
            episode:1,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          },{
            episode:2,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          },{
            episode:3,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          }]
        },
        {
          id: '2',
          title: 'Elephant Dream',
          description: 'The first Blender Open Movie from 2006',
          thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Elephants_Dream_16-9.jpg/320px-Elephants_Dream_16-9.jpg',
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
          thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Sintel_movie_poster.jpg/320px-Sintel_movie_poster.jpg',
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
        id: 'extra-' + video.id,
        isFavorite: Math.random() > 0.5,
        views: Math.floor(video.views * (0.5 + Math.random()))
      }));

      // Combine original and extra videos
      setMockVideosData([...mockVideos, ...extraVideos]);
      console.log(`Loaded ${mockVideos.length + extraVideos.length} mock videos successfully`);

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

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      navigation.navigate('Login');
    }
    setShowMenu(false);
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const navigateToProfile = () => {
    navigation.navigate('Profile');
    setShowMenu(false);
  };

  const navigateToVideoDetails = (video) => {
    console.log('Navigating to video player with video:', video.title);
    navigation.navigate('VideoPlayer', { video });
  };

  const handleRefresh = () => {
    loadMockVideos();
  };

  const handleToggleFavorite = (videoId) => {
    // Update the mock videos data to toggle favorite
    setMockVideosData(prevVideos =>
      prevVideos.map(video =>
        video.id === videoId
          ? { ...video, isFavorite: !video.isFavorite }
          : video
      )
    );
  };

  const renderVideoItem = ({ item }) => (
    <TouchableOpacity
      style={styles.videoItem}
      onPress={() => navigateToVideoDetails(item)}
    >
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: item.thumbnail }}
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
        {item.author?.avatar && (
          <Image
            source={{ uri: item.author.avatar }}
            style={styles.channelAvatar}
          />
        )}

        <View style={styles.videoTextContent}>
          <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.videoSubtitle} numberOfLines={1}>
            {item.author?.name || item.channel}
          </Text>
          <Text style={styles.videoInfo} numberOfLines={1}>
            {item.views} views • {item.publishDate || 'Unknown date'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <Image
          source={LogoImage}
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

        <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      {isLoading && videos.length === 0 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#f44336" />
          <Text style={styles.loadingText}>Loading videos...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadMockVideos}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={videos}
          renderItem={renderVideoItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={1}
          contentContainerStyle={styles.videoList}
          showsVerticalScrollIndicator={false}
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
        />
      )}

      {/* Hamburger Menu Modal */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={navigateToProfile}
            >
              <Text style={styles.menuItemText}>Profile</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleLogout}
            >
              <Text style={styles.menuItemText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 15,
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
  videoList: {
    padding: 12,
    flexGrow: 1,
  },
  videoItem: {
    width: '100%',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
  },
  thumbnail: {
    width: THUMBNAIL_WIDTH,
    height: THUMBNAIL_HEIGHT,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#f0f0f0',
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
  },
  videoDetails: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'flex-start',
  },
  channelAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  videoTextContent: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  videoSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  videoInfo: {
    fontSize: 12,
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
    shadowOffset: { width: 0, height: 2 },
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
});
