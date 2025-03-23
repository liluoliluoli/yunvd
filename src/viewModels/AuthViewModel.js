import { useState, useEffect, useCallback } from 'react';
import authService from '../services/AuthService';
import User from '../models/User';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/ApiConstants';
import NetworkUtils from '../utils/NetworkUtils';
import { Platform } from 'react-native';

// Mock local storage for web
const webStorage = {
  _data: {},
  setItem: function(key, value) {
    console.log(`[Web Storage] Setting ${key}`);
    this._data[key] = value;
    return Promise.resolve();
  },
  getItem: function(key) {
    console.log(`[Web Storage] Getting ${key}`);
    return Promise.resolve(this._data[key] || null);
  },
  removeItem: function(key) {
    console.log(`[Web Storage] Removing ${key}`);
    delete this._data[key];
    return Promise.resolve();
  }
};

// Use AsyncStorage on native, webStorage on web
const storage = Platform.OS === 'web' ? webStorage : AsyncStorage;

/**
 * Authentication view model hook for managing auth state and operations
 * @returns {Object} - Auth state and methods
 */
const useAuthViewModel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Initialize auth state on component mount
  useEffect(() => {
    console.log('AuthViewModel initialized');
    checkAuthStatus().catch(err => {
      console.error('Auth check failed:', err);
    });
  }, []);

  /**
   * Check if user is authenticated
   * @returns {Promise<void>}
   */
  const checkAuthStatus = useCallback(async () => {
    try {
      console.log('Checking auth status');
      setIsLoading(true);
      
      const userToken = await storage.getItem('userToken');
      console.log('User token:', userToken ? 'Found' : 'Not found');
      
      if (userToken) {
        const userDataString = await storage.getItem('userData');
        console.log('User data:', userDataString ? 'Found' : 'Not found');
        
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          setUser(userData);
          console.log('User loaded:', userData.email);
        } else {
          // For web testing, create a dummy user
          if (Platform.OS === 'web') {
            const dummyUser = { email: 'demo@example.com', name: 'Demo User' };
            setUser(dummyUser);
            await storage.setItem('userData', JSON.stringify(dummyUser));
            console.log('Created dummy user for web testing');
          }
        }
        setIsAuthenticated(true);
        return true;
      }
      
      // For web testing, auto-login with demo account
      if (Platform.OS === 'web' && !userToken) {
        console.log('Auto-logging in for web testing');
        await storage.setItem('userToken', 'web-demo-token-' + Date.now());
        const dummyUser = { email: 'demo@example.com', name: 'Demo User' };
        await storage.setItem('userData', JSON.stringify(dummyUser));
        setUser(dummyUser);
        setIsAuthenticated(true);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch user profile
   * @private
   * @returns {Promise<void>}
   */
  const fetchUserProfile = async () => {
    try {
      const profileData = await authService.getProfile();
      if (profileData && profileData.user) {
        const userModel = new User(profileData.user);
        setUser(userModel);
        
        // Update user data in storage
        await storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(profileData.user));
      }
    } catch (error) {
      console.log('Error fetching user profile:', error);
      // If we can't fetch profile, user may not be authenticated
      if (error.status === 401) {
        await handleLogout();
      }
    }
  };

  /**
   * Login with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<boolean>} - Success indicator
   */
  const login = useCallback(async (email, password) => {
    try {
      console.log('Logging in user:', email);
      setIsLoading(true);
      clearError();
      const response = await authService.login(email, password);
      console.log('Logging in user after authservice:', response);
      if (response && response.accessToken) {
      await storage.setItem('userToken', 'user-token-' + response.accessToken);
      
      // Create a dummy user object
      const userData = { email, name: email.split('@')[0] };
      await storage.setItem('userData', JSON.stringify(userData));
      
      setIsAuthenticated(true);
      setUser(userData);
      console.log('Login successful');
      
      return true;
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please check your credentials and try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<boolean>} - Success indicator
   */
  const register = useCallback(async (userData) => {
  try {
    console.log('Registering user:', userData.email);
    setIsLoading(true);
    clearError();

    // Call AuthService register function
    const response = await authService.register(userData);

    if (response && response.token) {
      // Store authentication data from the response
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.token));
      
      setIsAuthenticated(true);
      setUser(response.token);
      console.log('Registration successful');
      
      return true;
    } else {
      setError('Registration failed. Please try again.');
      return false;
    }
  } catch (error) {
    console.error('Registration error:', error);
    setError('Registration failed. Please try again.');
    return false;
  } finally {
    setIsLoading(false);
  }
}, [clearError]);




  /**
   * Logout the current user
   * @returns {Promise<boolean>} - Success indicator
   */
  const logout = useCallback(async () => {
    try {
      console.log('Logging out user');
      setIsLoading(true);
      
      // Clear auth token and user data
      await storage.removeItem('userToken');
      await storage.removeItem('userData');
      
      setIsAuthenticated(false);
      setUser(null);
      console.log('Logout successful');
      
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      setError('Logout failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Handle logout process
   * @private
   * @returns {Promise<void>}
   */
  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<boolean>} - Success indicator
   */
  const updateProfile = async (profileData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.updateProfile(profileData);
      
      if (response && response.user) {
        setUser(new User(response.user));
      }
      
      return true;
    } catch (error) {
      console.log('Update profile error:', error);
      setError(NetworkUtils.getErrorMessage(error));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Change user password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>} - Success indicator
   */
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await authService.changePassword(currentPassword, newPassword);
      return true;
    } catch (error) {
      console.log('Change password error:', error);
      setError(NetworkUtils.getErrorMessage(error));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Send password reset email
   * @param {string} email - User email
   * @returns {Promise<boolean>} - Success indicator
   */
  const forgotPassword = async (email) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await authService.forgotPassword(email);
      return true;
    } catch (error) {
      console.log('Forgot password error:', error);
      setError(NetworkUtils.getErrorMessage(error));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reset password with reset token
   * @param {string} token - Password reset token
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>} - Success indicator
   */
  const resetPassword = async (token, newPassword) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await authService.resetPassword(token, newPassword);
      return true;
    } catch (error) {
      console.log('Reset password error:', error);
      setError(NetworkUtils.getErrorMessage(error));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login with Google
   * @param {string} idToken - Google ID token
   * @returns {Promise<boolean>} - Success indicator
   */
  const loginWithGoogle = async (idToken) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.loginWithGoogle(idToken);
      
      // Update state
      setIsAuthenticated(true);
      setUser(new User(response.user));
      
      return true;
    } catch (error) {
      console.log('Google login error:', error);
      setError(NetworkUtils.getErrorMessage(error));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login with Apple
   * @param {string} identityToken - Apple identity token
   * @returns {Promise<boolean>} - Success indicator
   */
  const loginWithApple = async (identityToken) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.loginWithApple(identityToken);
      
      // Update state
      setIsAuthenticated(true);
      setUser(new User(response.user));
      
      return true;
    } catch (error) {
      console.log('Apple login error:', error);
      setError(NetworkUtils.getErrorMessage(error));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clear any auth errors
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    isAuthenticated,
    user,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    loginWithGoogle,
    loginWithApple,
    clearError,
    refreshUser: fetchUserProfile,
    checkAuthStatus
  };
};

export default useAuthViewModel; 