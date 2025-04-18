import {useState, useCallback, useEffect} from 'react';
import VideoService from '../services/VideoService';
import Video from '../models/VideoItem';
import Category from '../models/Category';
import NetworkUtils from '../utils/NetworkUtils';

/**
 * Home View Model with hooks-based state management
 * @returns {Object} Home screen state and operations
 */
const useHomeViewModel = () => {
    // VideoItem data states
    const [featuredVideos, setFeaturedVideos] = useState([]);
    const [trendingVideos, setTrendingVideos] = useState([]);
    const [recommendedVideos, setRecommendedVideos] = useState([]);
    const [categoryVideos, setCategoryVideos] = useState([]);
    const [searchResults, setSearchResults] = useState([]);

    // Loading states
    const [isFeaturedLoading, setIsFeaturedLoading] = useState(false);
    const [isTrendingLoading, setIsTrendingLoading] = useState(false);
    const [isRecommendedLoading, setIsRecommendedLoading] = useState(false);
    const [isCategoryVideosLoading, setIsCategoryVideosLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Error states
    const [featuredError, setFeaturedError] = useState(null);
    const [trendingError, setTrendingError] = useState(null);
    const [recommendedError, setRecommendedError] = useState(null);
    const [categoryVideosError, setCategoryVideosError] = useState(null);
    const [searchError, setSearchError] = useState(null);

    // Categories
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    // Watch history
    const [watchHistory, setWatchHistory] = useState([]);
    const [watchHistoryLoading, setWatchHistoryLoading] = useState(false);
    const [watchHistoryError, setWatchHistoryError] = useState(null);

    /**
     * Load initial data when component mounts
     */
    useEffect(() => {
        console.log('HomeViewModel initialized');
        fetchCategories().catch(err => {
            console.error('Failed to fetch categories in initial load:', err);
        });

        // Add fallback videos for web testing
        if (featuredVideos.length === 0 && trendingVideos.length === 0 && recommendedVideos.length === 0) {
            console.log('Setting fallback videos for testing');
            const fallbackVideos = [
                {
                    id: 1,
                    title: 'Introduction to React Native',
                    thumbnail: 'https://i.imgur.com/7WpRgQr.jpg',
                    duration: '10:30',
                    channel: 'React Native Channel',
                    views: 12500,
                    likes: 450,
                    isFavorite: false
                },
                {
                    id: 2,
                    title: 'Building UI Components in React Native',
                    thumbnail: 'https://i.imgur.com/RkuRKuh.jpg',
                    duration: '15:45',
                    channel: 'Mobile Dev Tutorials',
                    views: 8700,
                    likes: 320,
                    isFavorite: true
                },
                {
                    id: 3,
                    title: 'React native advance features',
                    thumbnail: 'https://i.imgur.com/7WpRgQr.jpg',
                    duration: '10:30',
                    channel: 'React Native Channel',
                    views: 12500,
                    likes: 450,
                    isFavorite: false
                },
                {
                    id: 4,
                    title: 'iOS application development concepts',
                    thumbnail: 'https://i.imgur.com/RkuRKuh.jpg',
                    duration: '12:45',
                    channel: 'Mobile Dev Tutorials',
                    views: 8700,
                    likes: 320,
                    isFavorite: true
                },
                {
                    id: 5,
                    title: 'Introduction to React Native',
                    thumbnail: 'https://i.imgur.com/7WpRgQr.jpg',
                    duration: '13:30',
                    channel: 'React Native Channel',
                    views: 12500,
                    likes: 450,
                    isFavorite: false
                },
                {
                    id: 6,
                    title: 'Building UI Components in React Native',
                    thumbnail: 'https://i.imgur.com/RkuRKuh.jpg',
                    duration: '14:45',
                    channel: 'Mobile Dev Tutorials',
                    views: 8700,
                    likes: 320,
                    isFavorite: true
                }
            ];
            setFeaturedVideos(fallbackVideos);
        }
    }, []);

    /**
     * Load data for selected category when it changes
     */
    useEffect(() => {
        if (selectedCategory) {
            loadCategoryVideos(selectedCategory.id);
        }
    }, [selectedCategory]);

    /**
     * Load all initial data for the home screen
     */
    const loadInitialData = async () => {
        setIsRefreshing(true);

        try {
            // Fetch featured videos
            fetchFeaturedVideos();

            // Fetch trending videos
            fetchTrendingVideos();

            // Fetch recommended videos
            fetchRecommendedVideos();

            // Fetch categories if needed
            if (categories.length === 0) {
                fetchCategories();
            }
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    /**
     * Refresh all data
     * @returns {Promise<void>}
     */
    const refreshData = useCallback(async () => {
        console.log('refreshData called');
        setIsRefreshing(true);

        try {
            // Fetch featured videos
            await fetchFeaturedVideos();

            // Fetch trending videos
            await fetchTrendingVideos();

            // Fetch recommended videos
            await fetchRecommendedVideos();

            // Fetch categories if needed
            if (categories.length === 0) {
                await fetchCategories();
            }

            console.log('All data fetched successfully');
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setIsRefreshing(false);
        }
    }, [categories.length]);

    /**
     * Fetch featured videos from API
     * @returns {Promise<void>}
     */
    const fetchFeaturedVideos = useCallback(async () => {
        try {
            console.log('Fetching featured videos...');
            setIsFeaturedLoading(true);
            setFeaturedError(null);

            const response = await VideoService.getAllVideos();
            // In a real app, you'd filter for featured videos here
            // For demo, just use the first 2 videos
            setFeaturedVideos(response.data.slice(0, 2));
            console.log('Featured videos fetched:', response.data.slice(0, 2).length);
        } catch (error) {
            console.error('Error fetching featured videos:', error);
            setFeaturedError(error.message || 'Failed to load featured videos');

            // Fallback for web demo
            setFeaturedVideos([
                {
                    id: 1,
                    title: 'Introduction to React Native',
                    thumbnail: 'https://i.imgur.com/7WpRgQr.jpg',
                    duration: '10:30',
                    channel: 'React Native Channel',
                    views: 12500,
                    likes: 450,
                    isFavorite: false
                }
            ]);
        } finally {
            setIsFeaturedLoading(false);
        }
    }, []);

    /**
     * Fetch trending videos from API
     * @returns {Promise<void>}
     */
    const fetchTrendingVideos = useCallback(async () => {
        try {
            console.log('Fetching trending videos...');
            setIsTrendingLoading(true);
            setTrendingError(null);

            const response = await VideoService.getAllVideos();
            // In a real app, you'd filter for trending videos
            // For demo, just use videos 2-4
            setTrendingVideos(response.data.slice(2, 4));
            console.log('Trending videos fetched:', response.data.slice(2, 4).length);
        } catch (error) {
            console.error('Error fetching trending videos:', error);
            setTrendingError(error.message || 'Failed to load trending videos');

            // Fallback for web demo
            setTrendingVideos([
                {
                    id: 3,
                    title: 'State Management with Redux',
                    thumbnail: 'https://i.imgur.com/0dgwpJy.jpg',
                    duration: '20:15',
                    channel: 'Redux Masters',
                    views: 15600,
                    likes: 780,
                    isFavorite: false
                }
            ]);
        } finally {
            setIsTrendingLoading(false);
        }
    }, []);

    /**
     * Fetch recommended videos from API
     * @returns {Promise<void>}
     */
    const fetchRecommendedVideos = useCallback(async () => {
        try {
            console.log('Fetching recommended videos...');
            setIsRecommendedLoading(true);
            setRecommendedError(null);

            const response = await VideoService.getAllVideos();
            // In a real app, you'd filter for recommended videos
            // For demo, just use the last 2 videos
            setRecommendedVideos(response.data.slice(4));
            console.log('Recommended videos fetched:', response.data.slice(4).length);
        } catch (error) {
            console.error('Error fetching recommended videos:', error);
            setRecommendedError(error.message || 'Failed to load recommended videos');

            // Fallback for web demo
            setRecommendedVideos([
                {
                    id: 5,
                    title: 'Using Hooks in Function Components',
                    thumbnail: 'https://i.imgur.com/FQGHojk.jpg',
                    duration: '18:30',
                    channel: 'Hooks Tutorials',
                    views: 11200,
                    likes: 530,
                    isFavorite: false
                }
            ]);
        } finally {
            setIsRecommendedLoading(false);
        }
    }, []);

    /**
     * Fetch video categories from API
     * @returns {Promise<void>}
     */
    const fetchCategories = useCallback(async () => {
        try {
            console.log('Fetching categories...');
            const response = await VideoService.getCategories();
            setCategories(response.data);
            console.log('Categories fetched:', response.data.length);
        } catch (error) {
            console.error('Error fetching categories:', error);
            // Not setting a primary error state here as this is secondary functionality

            // Fallback for web demo
            setCategories([
                {id: 1, name: 'Technology', icon: '💻'},
                {id: 2, name: 'Education', icon: '📚'}
            ]);
        }
    }, []);

    /**
     * Fetch videos for a specific category
     * @param {string} categoryId - Category ID
     * @returns {Promise<void>}
     */
    const loadCategoryVideos = async (categoryId) => {
        try {
            setIsCategoryVideosLoading(true);
            setCategoryVideosError(null);
            setSelectedCategory(categoryId);

            const response = await VideoService.getVideosByCategory(categoryId);
            setCategoryVideos(response.data);
        } catch (error) {
            setCategoryVideosError(error.message || 'Failed to load category videos');
            console.error(`Error fetching videos for category ${categoryId}:`, error);
        } finally {
            setIsCategoryVideosLoading(false);
        }
    };

    /**
     * Search videos by query
     * @param {string} query - Search query
     * @returns {Promise<void>}
     */
    const updateSearchQuery = useCallback(async (query) => {
        if (!query) {
            clearSearch();
            return;
        }

        try {
            setIsSearching(true);
            setSearchError(null);

            const response = await VideoService.searchVideos(query);
            setSearchResults(response.data);
        } catch (error) {
            console.error('Error searching videos:', error);
            setSearchError(error.message || 'Failed to search videos');
        } finally {
            setIsSearching(false);
        }
    }, []);

    /**
     * Clear search results
     */
    const clearSearch = useCallback(() => {
        setSearchResults([]);
        setSearchError(null);
    }, []);

    /**
     * Toggle favorite status for a video
     * @param {string} videoId - VideoItem ID
     * @returns {Promise<boolean>} - Success status
     */
    const toggleFavorite = useCallback(async (videoId) => {
        try {
            await VideoService.toggleFavorite(videoId);

            // Update all video lists by toggling the isFavorite property
            const updateVideoList = (list) =>
                list.map(video =>
                    video.id === videoId
                        ? {...video, isFavorite: !video.isFavorite}
                        : video
                );

            setFeaturedVideos(updateVideoList(featuredVideos));
            setTrendingVideos(updateVideoList(trendingVideos));
            setRecommendedVideos(updateVideoList(recommendedVideos));
            setCategoryVideos(updateVideoList(categoryVideos));
            setSearchResults(updateVideoList(searchResults));

            return true;
        } catch (error) {
            console.error('Error toggling favorite:', error);
            return false;
        }
    }, [featuredVideos, trendingVideos, recommendedVideos, categoryVideos, searchResults]);

    /**
     * Load watch history
     * @returns {Promise<void>}
     */
    const loadWatchHistory = async () => {
        try {
            setWatchHistoryLoading(true);
            setWatchHistoryError(null);

            // Try to get from API first, then fall back to local storage
            try {
                const response = await VideoService.getWatchHistory();
                const videos = (response.data || []).map(videoData => new Video(videoData));
                setWatchHistory(videos);
            } catch (error) {
                // If API call fails, try local storage
                const localHistoryIds = await VideoService.getLocalWatchHistory();

                // If we have local IDs but can't fetch details, just show empty state
                if (localHistoryIds.length > 0) {
                    // We could fetch details for each video, but for now we'll just show empty state
                    setWatchHistory([]);
                } else {
                    setWatchHistory([]);
                }
            }
        } catch (error) {
            console.log('Watch history error:', error);
            setWatchHistoryError(NetworkUtils.getErrorMessage(error));
        } finally {
            setWatchHistoryLoading(false);
        }
    };

    /**
     * Toggle video like status
     * @param {string} videoId - VideoItem ID
     * @param {boolean} isCurrentlyLiked - Current like status
     * @returns {Promise<boolean>} - New like status
     */
    const toggleVideoLike = async (videoId, isCurrentlyLiked) => {
        try {
            if (isCurrentlyLiked) {
                await VideoService.unlikeVideo(videoId);
                return false;
            } else {
                await VideoService.likeVideo(videoId);
                return true;
            }
        } catch (error) {
            console.log('Toggle like error:', error);
            throw error;
        }
    };

    /**
     * Toggle watchlist status for a video
     * @param {string} videoId - VideoItem ID
     * @param {boolean} isCurrentlyInWatchlist - Current watchlist status
     * @returns {Promise<boolean>} - New watchlist status
     */
    const toggleWatchlist = async (videoId, isCurrentlyInWatchlist) => {
        try {
            if (isCurrentlyInWatchlist) {
                await VideoService.removeFromWatchlist(videoId);
                return false;
            } else {
                await VideoService.addToWatchlist(videoId);
                return true;
            }
        } catch (error) {
            console.log('Toggle watchlist error:', error);
            throw error;
        }
    };

    return {
        // State
        featuredVideos,
        trendingVideos,
        recommendedVideos,
        categories,
        selectedCategory,
        categoryVideos,
        searchQuery: '',
        searchResults,

        // Loading states
        isFeaturedLoading,
        isTrendingLoading,
        isRecommendedLoading,
        isCategoriesLoading: false,
        isCategoryVideosLoading,
        isSearching,
        isRefreshing,
        watchHistoryLoading,

        // Errors
        featuredError,
        trendingError,
        recommendedError,
        categoriesError: null,
        categoryVideosError,
        searchError,
        watchHistoryError,

        // Methods
        refreshData,
        updateSearchQuery,
        clearSearch,
        toggleFavorite,
        loadWatchHistory,
        toggleVideoLike,
        toggleWatchlist,
        setSelectedCategory
    };
};

export default useHomeViewModel;
