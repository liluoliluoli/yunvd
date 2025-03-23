import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { API_BASE_URL, STORAGE_KEYS } from '../utils/ApiConstants';
import NetworkUtils from '../utils/NetworkUtils';

/**
 * API Client for handling HTTP requests to the backend
 */
class ApiClient {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });

    // Add request interceptor for auth token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // Only attempt to get token if not on web platform for now
        if (Platform.OS !== 'web') {
          try {
            const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
            }
          } catch (error) {
            console.error('Failed to get auth token:', error);
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for handling common errors
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response.data;
      },
      (error) => {
        // Enhanced error handling
        console.error('API error:', error);
        
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Response error:', error.response.status, error.response.data);
          
          if (error.response.status === 401) {
            // Handle unauthorized - possibly redirect to login
            // This is a placeholder and should be implemented based on app requirements
            console.error('Authentication error: User unauthorized');
          }
          
          return Promise.reject({
            status: error.response.status,
            data: error.response.data,
            message: error.response.data?.message || 'An error occurred with the API'
          });
        } else if (error.request) {
          // The request was made but no response was received
          console.error('Request error, no response received:', error.request);
          
          // Handle network errors gracefully
          if (!NetworkUtils.isConnected()) {
            return Promise.reject({
              isNetworkError: true,
              message: 'No internet connection. Please check your network and try again.'
            });
          }
          
          return Promise.reject({
            message: 'Unable to reach the server. Please try again later.'
          });
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error setting up request:', error.message);
          return Promise.reject({
            message: 'An error occurred while preparing the request.'
          });
        }
      }
    );

    console.log(`[ApiClient] Initialized - Platform: ${Platform.OS}`);
  }

  /**
   * Make a GET request
   * @param {string} url - The endpoint to fetch from
   * @param {Object} params - Query parameters
   * @returns {Promise<any>} - Response data
   */
  async get(url, params = {}) {
    try {
      console.log(`[ApiClient] GET request to ${url}`);
      if (Platform.OS === 'web') {
        console.log(`[ApiClient] Web platform detected, this might be a mock endpoint`);
      }
      
      // Check network connectivity before making request
      if (!NetworkUtils.isConnected()) {
        throw {
          isNetworkError: true,
          message: 'No internet connection'
        };
      }
      
      return await this.axiosInstance.get(url, { params });
    } catch (error) {
      console.error(`[ApiClient] GET request failed for ${url}:`, error);
      throw NetworkUtils.handleApiError(error);
    }
  }

  /**
   * Make a POST request
   * @param {string} url - The endpoint to post to
   * @param {Object} data - Data to send in the request body
   * @returns {Promise<any>} - Response data
   */
  async post(url, data = {}) {
    try {
      console.log(`[ApiClient] POST request to ${url}`);
      if (Platform.OS === 'web') {
        console.log(`[ApiClient] Web platform detected, this might be a mock endpoint`);
      }
      
      // Check network connectivity before making request
      if (!NetworkUtils.isConnected()) {
        throw {
          isNetworkError: true,
          message: 'No internet connection'
        };
      }
      console.log(`[ApiClient] POST request with data ${data}`);
      return await this.axiosInstance.post(url, data);
    } catch (error) {
      console.error(`[ApiClient] POST request failed for ${url}:`, error);
      throw NetworkUtils.handleApiError(error);
    }
  }

  /**
   * Make a PUT request
   * @param {string} url - The endpoint to put to
   * @param {Object} data - Data to send in the request body
   * @returns {Promise<any>} - Response data
   */
  async put(url, data = {}) {
    try {
      console.log(`[ApiClient] PUT request to ${url}`);
      
      // Check network connectivity before making request
      if (!NetworkUtils.isConnected()) {
        throw {
          isNetworkError: true,
          message: 'No internet connection'
        };
      }
      
      return await this.axiosInstance.put(url, data);
    } catch (error) {
      console.error(`[ApiClient] PUT request failed for ${url}:`, error);
      throw NetworkUtils.handleApiError(error);
    }
  }

  /**
   * Make a DELETE request
   * @param {string} url - The endpoint to delete from
   * @returns {Promise<any>} - Response data
   */
  async delete(url) {
    try {
      console.log(`[ApiClient] DELETE request to ${url}`);
      
      // Check network connectivity before making request
      if (!NetworkUtils.isConnected()) {
        throw {
          isNetworkError: true,
          message: 'No internet connection'
        };
      }
      
      return await this.axiosInstance.delete(url);
    } catch (error) {
      console.error(`[ApiClient] DELETE request failed for ${url}:`, error);
      throw NetworkUtils.handleApiError(error);
    }
  }
}

export default ApiClient; 