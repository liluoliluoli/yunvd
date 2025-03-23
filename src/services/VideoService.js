import { Platform } from 'react-native';
import ApiClient from './ApiClient';
import { VIDEO_ENDPOINTS, USER_ENDPOINTS } from '../utils/ApiConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetworkUtils from '../utils/NetworkUtils';
import axios from 'axios';

// Mock data for web testing
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
    publishDate: '2008-05-20'
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

const mockCategories = [
  { id: '1', name: 'Animation', count: 3 },
  { id: '2', name: 'Fantasy', count: 2 },
  { id: '3', name: 'Short', count: 1 },
  { id: '4', name: 'Action', count: 1 }
];

/**
 * Service for handling video-related operations
 */
class VideoService {
  constructor() {
    this.apiClient = new ApiClient();
    this.isWeb = Platform.OS === 'web';
    console.log(`[VideoService] Initialized - Platform: ${Platform.OS}`);
  }

  /**
   * Get all videos (combined featured and regular)
   * @returns {Promise<Object>} - All videos 
   */
  async getAllVideos() {
    try {
      // Check network connection using the fixed NetworkUtils
      const isConnected = await NetworkUtils.isConnected();
      
      if (!isConnected) {
        throw new Error('No internet connection');
      }

      // Return mock data
      return {
        data: [...mockVideos]
      };
      
      // With real API, use:
      // return await apiClient.get(VIDEO_ENDPOINTS.ALL_VIDEOS);
    } catch (error) {
      console.error('Error getting all videos:', error);
      throw error;
    }
  }

  /**
   * Get featured videos
   * @param {Object} options - Request options
   * @param {number} options.page - Page number
   * @param {number} options.limit - Number of items per page
   * @returns {Promise<Object>} - Featured videos with pagination
   */
  async getFeaturedVideos({ page = 1, limit = 10 } = {}) {
    try {
      console.log('[VideoService] Getting featured videos');
      if (this.isWeb) {
        console.log('[VideoService] Using mock data for web');
        return { data: mockVideos };
      }
      
      const response = await this.apiClient.get('/videos/featured');
      return response;
    } catch (error) {
      console.error('[VideoService] Error getting featured videos:', error);
      if (this.isWeb) {
        return { data: mockVideos };
      }
      throw NetworkUtils.handleApiError(error);
    }
  }

  /**
   * Get trending videos
   * @param {Object} options - Request options
   * @param {number} options.page - Page number
   * @param {number} options.limit - Number of items per page
   * @returns {Promise<Object>} - Trending videos with pagination
   */
  async getTrendingVideos({ page = 1, limit = 10 } = {}) {
    try {
      console.log('[VideoService] Getting trending videos');
      if (this.isWeb) {
        console.log('[VideoService] Using mock data for web');
        return { data: [...mockVideos].reverse() };
      }
      
      const response = await this.apiClient.get('/videos/trending');
      return response;
    } catch (error) {
      console.error('[VideoService] Error getting trending videos:', error);
      if (this.isWeb) {
        return { data: [...mockVideos].reverse() };
      }
      throw NetworkUtils.handleApiError(error);
    }
  }

  /**
   * Get recommended videos for the user
   * @param {Object} options - Request options
   * @param {number} options.page - Page number
   * @param {number} options.limit - Number of items per page
   * @returns {Promise<Object>} - Recommended videos with pagination
   */
  async getRecommendedVideos({ page = 1, limit = 10 } = {}) {
    try {
      console.log('[VideoService] Getting recommended videos');
      if (this.isWeb) {
        console.log('[VideoService] Using mock data for web');
        // Shuffle the mock videos for recommended
        return { data: [...mockVideos].sort(() => 0.5 - Math.random()) };
      }
      
      const response = await this.apiClient.get('/videos/recommended');
      return response;
    } catch (error) {
      console.error('[VideoService] Error getting recommended videos:', error);
      if (this.isWeb) {
        return { data: [...mockVideos].sort(() => 0.5 - Math.random()) };
      }
      throw NetworkUtils.handleApiError(error);
    }
  }

  /**
   * Get video by ID
   * @param {string|number} id Video ID
   * @returns {Promise<Object>} Promise with video data
   */
  async getVideoById(id) {
    try {
      // Mock data
      const allVideos = await this.getAllVideos();
      const video = allVideos.data.find(v => v.id.toString() === id.toString());
      
      if (!video) {
        throw new Error('Video not found');
      }
      
      return { data: video };
      
      // With real API:
      // return await apiClient.get(`/videos/${id}`);
    } catch (error) {
      console.error(`Error getting video ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get videos by category
   * @param {string|number} categoryId - Category ID
   * @param {Object} options - Request options
   * @param {number} options.page - Page number
   * @param {number} options.limit - Number of items per page
   * @returns {Promise<Object>} - Videos in the category with pagination
   */
  async getVideosByCategory(categoryId, { page = 1, limit = 10 } = {}) {
    try {
      console.log(`[VideoService] Getting videos for category ${categoryId}`);
      if (this.isWeb) {
        console.log('[VideoService] Using mock data for web');
        // Filter videos based on category
        const category = mockCategories.find(c => c.id === categoryId);
        if (category) {
          const filteredVideos = mockVideos.filter(v => 
            v.categories.includes(category.name)
          );
          return { data: filteredVideos };
        }
        return { data: mockVideos };
      }
      
      const response = await this.apiClient.get(`/videos/category/${categoryId}`);
      return response;
    } catch (error) {
      console.error(`[VideoService] Error getting videos for category ${categoryId}:`, error);
      if (this.isWeb) {
        return { data: mockVideos };
      }
      throw NetworkUtils.handleApiError(error);
    }
  }

  /**
   * Get all video categories
   * @returns {Promise<Array>} - List of categories
   */
  async getCategories() {
    try {
      // Check network connection
      const isConnected = await NetworkUtils.isConnected();
      
      if (!isConnected) {
        throw new Error('No internet connection');
      }
      
      // Return mock data
      return {
        data: [...mockCategories]
      };
      
      // With real API:
      // return await apiClient.get(VIDEO_ENDPOINTS.CATEGORIES);
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Search videos
   * @param {string} query - Search query
   * @param {Object} options - Request options
   * @param {number} options.page - Page number
   * @param {number} options.limit - Number of items per page
   * @returns {Promise<Object>} - Search results with pagination
   */
  async searchVideos(query, { page = 1, limit = 10 } = {}) {
    try {
      console.log(`[VideoService] Searching videos with query: ${query}`);
      if (this.isWeb) {
        console.log('[VideoService] Using mock data for web');
        // Filter videos based on search query
        const filteredVideos = mockVideos.filter(v => 
          v.title.toLowerCase().includes(query.toLowerCase()) || 
          v.description.toLowerCase().includes(query.toLowerCase())
        );
        return { data: filteredVideos.length > 0 ? filteredVideos : mockVideos };
      }
      
      const response = await this.apiClient.get(`/videos/search?q=${encodeURIComponent(query)}`);
      return response;
    } catch (error) {
      console.error(`[VideoService] Error searching videos with query: ${query}:`, error);
      if (this.isWeb) {
        return { data: mockVideos };
      }
      throw NetworkUtils.handleApiError(error);
    }
  }

  /**
   * Toggle favorite status for a video
   * @param {string|number} videoId Video ID
   * @returns {Promise<Object>} Promise with updated video data
   */
  async toggleFavorite(videoId) {
    try {
      // In a real app, you'd call the API to toggle the favorite status
      // For this demo, we'll just return success
      return { data: { success: true } };
      
      // With real API:
      // return await apiClient.post(`/videos/${videoId}/favorite`);
    } catch (error) {
      console.error(`Error toggling favorite for video ${videoId}:`, error);
      throw error;
    }
  }

  /**
   * Get video details by ID
   * @param {string} videoId - Video ID
   * @returns {Promise<Object>} - Video details
   */
  async getVideoDetails(videoId) {
    try {
      console.log(`[VideoService] Getting details for video ${videoId}`);
      if (this.isWeb) {
        console.log('[VideoService] Using mock data for web');
        const video = mockVideos.find(v => v.id === videoId);
        if (video) {
          // Add comments for mock video
          return { 
            data: {
              ...video,
              comments: [
                { id: '1', user: 'John', text: 'Great video!', createdAt: '2022-01-15' },
                { id: '2', user: 'Sarah', text: 'I learned a lot from this', createdAt: '2022-01-16' }
              ],
              relatedVideos: mockVideos.filter(v => v.id !== videoId)
            }
          };
        }
        return { data: mockVideos[0] };
      }
      
      const response = await this.apiClient.get(`/videos/${videoId}`);
      return response;
    } catch (error) {
      console.error(`[VideoService] Error getting details for video ${videoId}:`, error);
      if (this.isWeb) {
        const video = mockVideos.find(v => v.id === videoId) || mockVideos[0];
        return { 
          data: {
            ...video,
            comments: [
              { id: '1', user: 'John', text: 'Great video!', createdAt: '2022-01-15' },
              { id: '2', user: 'Sarah', text: 'I learned a lot from this', createdAt: '2022-01-16' }
            ],
            relatedVideos: mockVideos.filter(v => v.id !== videoId)
          }
        };
      }
      throw NetworkUtils.handleApiError(error);
    }
  }

  /**
   * Get video comments
   * @param {string} videoId - Video ID
   * @param {Object} options - Request options
   * @param {number} options.page - Page number
   * @param {number} options.limit - Number of items per page
   * @returns {Promise<Object>} - Comments with pagination
   */
  async getVideoComments(videoId, { page = 1, limit = 10 } = {}) {
    try {
      // Return mock comments data
      return {
        data: [
          { id: 1, username: 'user1', text: 'Great video!', timestamp: '2023-10-15T10:30:00Z' },
          { id: 2, username: 'user2', text: 'Thanks for the tutorial', timestamp: '2023-10-15T11:45:00Z' },
          { id: 3, username: 'user3', text: 'Very helpful content', timestamp: '2023-10-16T09:20:00Z' }
        ]
      };
      
      // With real API:
      // return await apiClient.get(VIDEO_ENDPOINTS.VIDEO_COMMENTS(videoId), { page, limit });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add a comment to a video
   * @param {string} videoId - Video ID
   * @param {string} content - Comment content
   * @returns {Promise<Object>} - New comment details
   */
  async addComment(videoId, content) {
    try {
      console.log(`[VideoService] Adding comment to video ${videoId}: ${content}`);
      if (this.isWeb) {
        console.log('[VideoService] Using mock data for web');
        return { 
          data: { 
            id: Date.now().toString(),
            username: 'You',
            text: content,
            timestamp: new Date().toISOString()
          }
        };
      }
      
      const response = await this.apiClient.post(`/videos/${videoId}/comments`, { text: content });
      return response;
    } catch (error) {
      console.error(`[VideoService] Error adding comment to video ${videoId}:`, error);
      if (this.isWeb) {
        return { 
          data: { 
            id: Date.now().toString(),
            username: 'You',
            text: content,
            timestamp: new Date().toISOString()
          }
        };
      }
      throw NetworkUtils.handleApiError(error);
    }
  }

  /**
   * Get user's watchlist
   * @param {Object} options - Request options
   * @param {number} options.page - Page number
   * @param {number} options.limit - Number of items per page
   * @returns {Promise<Object>} - Watchlist videos with pagination
   */
  async getWatchlist({ page = 1, limit = 10 } = {}) {
    try {
      // Mock implementation
      return {
        data: []
      };
      // Real implementation:
      // return await apiClient.get(USER_ENDPOINTS.WATCHLIST, { page, limit });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user's watch history
   * @param {Object} options - Request options
   * @param {number} options.page - Page number
   * @param {number} options.limit - Number of items per page
   * @returns {Promise<Object>} - History videos with pagination
   */
  async getWatchHistory({ page = 1, limit = 10 } = {}) {
    try {
      // Mock implementation
      return {
        data: []
      };
      // Real implementation:
      // return await apiClient.get(USER_ENDPOINTS.HISTORY, { page, limit });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add video to watch history
   * @param {string} videoId - Video ID
   * @returns {Promise<Object>} - Response data
   */
  async addToWatchHistory(videoId) {
    try {
      // Try to update through API if user is logged in
      try {
        // Mock implementation:
        // await apiClient.post(USER_ENDPOINTS.HISTORY, { video_id: videoId });
        await this.addToLocalWatchHistory(videoId);
      } catch (error) {
        // If API call fails (e.g., user not logged in), store locally
        await this.addToLocalWatchHistory(videoId);
      }
      return { success: true };
    } catch (error) {
      console.log('Error adding to watch history:', error);
      // Fail silently - this is a background operation
      return { success: false };
    }
  }

  /**
   * Add video to local watch history
   * @private
   * @param {string} videoId - Video ID
   * @returns {Promise<void>}
   */
  async addToLocalWatchHistory(videoId) {
    try {
      const historyJson = await AsyncStorage.getItem('watchHistory');
      let history = historyJson ? JSON.parse(historyJson) : [];
      
      // Remove if already exists (to move to top)
      history = history.filter(id => id !== videoId);
      
      // Add to beginning of array
      history.unshift(videoId);
      
      // Limit history size
      if (history.length > 100) {
        history = history.slice(0, 100);
      }
      
      await AsyncStorage.setItem('watchHistory', JSON.stringify(history));
    } catch (error) {
      console.log('Error updating local watch history:', error);
    }
  }

  /**
   * Get local watch history
   * @returns {Promise<Array>} - Array of video IDs
   */
  async getLocalWatchHistory() {
    try {
      const historyJson = await AsyncStorage.getItem('watchHistory');
      return historyJson ? JSON.parse(historyJson) : [];
    } catch (error) {
      console.log('Error getting local watch history:', error);
      return [];
    }
  }

  /**
   * Get user's liked videos
   * @param {Object} options - Request options
   * @param {number} options.page - Page number
   * @param {number} options.limit - Number of items per page
   * @returns {Promise<Object>} - Liked videos with pagination
   */
  async getLikedVideos({ page = 1, limit = 10 } = {}) {
    try {
      // Mock implementation
      return {
        data: []
      };
      // Real implementation:
      // return await apiClient.get(USER_ENDPOINTS.LIKED_VIDEOS, { page, limit });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Rate a video
   * @param {string} videoId - Video ID
   * @param {number} rating - Rating value (1-5)
   * @returns {Promise<Object>} - Response data
   */
  async rateVideo(videoId, rating) {
    try {
      console.log(`[VideoService] Rating video ${videoId} with ${rating} stars`);
      if (this.isWeb) {
        console.log('[VideoService] Using mock data for web');
        // Update mock video rating
        const video = mockVideos.find(v => v.id === videoId);
        if (video) {
          video.rating = (video.rating + rating) / 2; // Simple average
        }
        return { success: true };
      }
      
      const response = await this.apiClient.post(`/videos/${videoId}/rate`, { rating });
      return response;
    } catch (error) {
      console.error(`[VideoService] Error rating video ${videoId}:`, error);
      if (this.isWeb) {
        return { success: true };
      }
      throw NetworkUtils.handleApiError(error);
    }
  }

  /**
   * Get related videos
   * @param {string} videoId - Video ID
   * @param {Object} options - Request options
   * @param {number} options.limit - Number of related videos to fetch
   * @returns {Promise<Object>} - Related videos
   */
  async getRelatedVideos(videoId, { limit = 10 } = {}) {
    try {
      // Mock implementation - just return a subset of all videos
      const allVideos = await this.getAllVideos();
      return {
        data: allVideos.data.filter(v => v.id !== parseInt(videoId)).slice(0, limit)
      };
      // Real implementation:
      // return await apiClient.get(`${VIDEO_ENDPOINTS.VIDEO_DETAILS(videoId)}/related`, { limit });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user's subscriptions
   * @param {Object} options - Request options
   * @param {number} options.page - Page number
   * @param {number} options.limit - Number of items per page
   * @returns {Promise<Object>} - Subscriptions with pagination
   */
  async getSubscriptions({ page = 1, limit = 10 } = {}) {
    try {
      // Mock implementation
      return {
        data: []
      };
      // Real implementation:
      // return await apiClient.get(USER_ENDPOINTS.SUBSCRIPTIONS, { page, limit });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Subscribe to a channel
   * @param {string} channelId - Channel ID
   * @returns {Promise<Object>} - Response data
   */
  async subscribeToChannel(channelId) {
    try {
      // Mock implementation
      return {
        data: { success: true }
      };
      // Real implementation:
      // return await apiClient.post(USER_ENDPOINTS.SUBSCRIBE(channelId));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Unsubscribe from a channel
   * @param {string} channelId - Channel ID
   * @returns {Promise<Object>} - Response data
   */
  async unsubscribeFromChannel(channelId) {
    try {
      // Mock implementation
      return {
        data: { success: true }
      };
      // Real implementation:
      // return await apiClient.post(USER_ENDPOINTS.UNSUBSCRIBE(channelId));
    } catch (error) {
      throw error;
    }
  }
}

// Export the class directly, not an instance
export default new VideoService(); 