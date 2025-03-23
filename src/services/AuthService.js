import ApiClient from './ApiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_ENDPOINTS, STORAGE_KEYS } from '../utils/ApiConstants';
import NetworkUtils from '../utils/NetworkUtils';

const apiClient = new ApiClient();
/**
 * Service for handling authentication-related operations
 */
class AuthService {
  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - Login response with user data and tokens
   */
  async login(email, password) {
    try {
      console.log('Logging in user:', email);
  
      const requestBody = {
        username: email,  // Ensure case-sensitive match with API requirements
        password: password
      };
  console.log('Logging in user request body:', requestBody);
      const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, requestBody);
  
      // Store tokens and user data if response contains authentication tokens
      if (response && response.accessToken) {
        await this.storeAuthData(response);
      }
  
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
  

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.name - User name
   * @returns {Promise<Object>} - Registration response
   */
  async register(userData) {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.REGISTER, userData);

      // If auto-login after registration, store tokens and user data
      if (response.access_token) {
        await this.storeAuthData(response);
      }

      return response;
    } catch (error) {
      console.log('Registration error:', error);
      throw error;
    }
  }

  /**
   * Store authentication data in local storage
   * @private
   * @param {Object} data - Authentication data with tokens and user info
   */
  async storeAuthData(data) {
    const { access_token, refresh_token, user } = data;
    
    const storageItems = [
      [STORAGE_KEYS.AUTH_TOKEN, access_token],
      [STORAGE_KEYS.REFRESH_TOKEN, refresh_token],
    ];

    if (user) {
      storageItems.push([STORAGE_KEYS.USER_DATA, JSON.stringify(user)]);
    }

    await AsyncStorage.multiSet(storageItems);
  }

  /**
   * Log out user by clearing stored tokens and data
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      // Call logout API if needed
      try {
        await apiClient.post('/auth/logout');
      } catch (error) {
        // Ignore API errors during logout
        console.log('Logout API error:', error);
      }

      // Clear local storage
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   * @returns {Promise<boolean>} - Is user authenticated
   */
  async isAuthenticated() {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      return !!token;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current user data from storage
   * @returns {Promise<Object|null>} - User data or null if not logged in
   */
  async getCurrentUser() {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Initiate password reset process
   * @param {string} email - User email
   * @returns {Promise<Object>} - API response
   */
  async forgotPassword(email) {
    try {
      return await apiClient.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reset password with token
   * @param {string} token - Reset token from email
   * @param {string} password - New password
   * @returns {Promise<Object>} - API response
   */
  async resetPassword(token, password) {
    try {
      return await apiClient.post(AUTH_ENDPOINTS.RESET_PASSWORD, {
        token,
        password,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify email with token
   * @param {string} token - Verification token
   * @returns {Promise<Object>} - API response
   */
  async verifyEmail(token) {
    try {
      return await apiClient.post(AUTH_ENDPOINTS.VERIFY_EMAIL, { token });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user profile
   * @returns {Promise<Object>} - User profile data
   */
  async getProfile() {
    try {
      return await apiClient.get(AUTH_ENDPOINTS.PROFILE);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} - Updated profile data
   */
  async updateProfile(profileData) {
    try {
      const response = await apiClient.put(AUTH_ENDPOINTS.UPDATE_PROFILE, profileData);
      
      // Update user data in storage
      const currentUserData = await this.getCurrentUser();
      if (currentUserData) {
        const updatedUserData = { ...currentUserData, ...response.user };
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUserData));
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user profile picture
   * @param {Object} formData - FormData with image file
   * @returns {Promise<Object>} - Updated profile data
   */
  async updateProfilePicture(formData) {
    try {
      const response = await apiClient.uploadFile(AUTH_ENDPOINTS.UPDATE_PROFILE, formData);
      
      // Update user data in storage
      const currentUserData = await this.getCurrentUser();
      if (currentUserData) {
        const updatedUserData = { ...currentUserData, ...response.user };
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUserData));
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Change user password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} - API response
   */
  async changePassword(currentPassword, newPassword) {
    try {
      return await apiClient.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, {
        current_password: currentPassword,
        new_password: newPassword,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Refresh authentication token
   * @returns {Promise<Object>} - New tokens
   */
  async refreshToken() {
    try {
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post(AUTH_ENDPOINTS.REFRESH_TOKEN, {
        refresh_token: refreshToken,
      });

      // Store new tokens
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.AUTH_TOKEN, response.access_token],
        [STORAGE_KEYS.REFRESH_TOKEN, response.refresh_token],
      ]);

      return response;
    } catch (error) {
      // Clear tokens on refresh error
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
      ]);
      throw error;
    }
  }

  /**
   * Login with Google
   * @param {string} idToken - Google ID token
   * @returns {Promise<Object>} - Login response
   */
  async loginWithGoogle(idToken) {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, {
        provider: 'google',
        id_token: idToken,
      });

      // Store tokens and user data
      await this.storeAuthData(response);

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login with Apple
   * @param {string} identityToken - Apple identity token
   * @returns {Promise<Object>} - Login response
   */
  async loginWithApple(identityToken) {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, {
        provider: 'apple',
        identity_token: identityToken,
      });

      // Store tokens and user data
      await this.storeAuthData(response);

      return response;
    } catch (error) {
      throw error;
    }
  }
}

// Create a singleton instance
const authService = new AuthService();

export default authService; 