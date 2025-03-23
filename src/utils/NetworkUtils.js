import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';

/**
 * Utility class for network-related operations
 */
class NetworkUtils {
  /**
   * Check if the device is connected to the internet
   * @returns {Promise<boolean>} True if connected, false otherwise
   */
  static async isConnected() {
    try {
      // Special handling for web platform
      if (Platform.OS === 'web') {
        return navigator.onLine;
      }
      
      // Using addEventListener approach instead of getCurrentState
      return new Promise((resolve) => {
        const unsubscribe = NetInfo.addEventListener(state => {
          unsubscribe(); // Unsubscribe once we get the state
          resolve(state.isConnected);
        });
      });
    } catch (error) {
      console.error('Error checking network connection:', error);
      return true; // Default to true to avoid blocking API calls unnecessarily
    }
  }

  /**
   * Get error message from API error
   * @param {Error} error - The error object
   * @returns {string} Formatted error message
   */
  static getErrorMessage(error) {
    if (!error) return 'Unknown error occurred';

    // For web platform, handle network errors differently
    if (Platform.OS === 'web' && !navigator.onLine) {
      return 'No internet connection. Please check your network settings.';
    }

    // Check network connection first
    if (error.isNetworkError) {
      return 'No internet connection. Please check your network settings.';
    }

    // Handle axios errors
    if (error.response) {
      // Server responded with an error status code
      const status = error.response.status;
      
      switch (status) {
        case 401:
          return 'Authentication failed. Please login again.';
        case 403:
          return 'You don\'t have permission to access this resource.';
        case 404:
          return 'The requested resource was not found.';
        case 500:
          return 'Server error. Please try again later.';
        default:
          return error.response.data?.message || `Error: ${status}`;
      }
    } else if (error.request) {
      // Request was made but no response received
      return 'No response from server. Please try again later.';
    } else {
      // Error setting up the request
      return error.message || 'Unknown error occurred';
    }
  }

  /**
   * Retry a function with exponential backoff
   * @param {Function} fn - The function to retry
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} baseDelay - Base delay in milliseconds
   * @returns {Promise<any>} Result of the function
   */
  static async retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    let retries = 0;
    
    const execute = async () => {
      try {
        return await fn();
      } catch (error) {
        if (retries >= maxRetries) {
          throw error;
        }
        
        const delay = baseDelay * Math.pow(2, retries);
        retries++;
        console.log(`Retrying operation. Attempt ${retries} of ${maxRetries} after ${delay}ms`);
        
        return new Promise(resolve => {
          setTimeout(() => resolve(execute()), delay);
        });
      }
    };
    
    return execute();
  }

  /**
   * Format API error message for display
   * @param {Object} error - Error object from API call
   * @returns {string} - Formatted error message
   */
  static getErrorMessageForDisplay(error) {
    // Network connectivity error
    if (error?.isNetworkError) {
      return 'Please check your internet connection and try again.';
    }
    
    // Authentication error
    if (error?.status === 401) {
      return 'Your session has expired. Please log in again.';
    }
    
    // Server error
    if (error?.status >= 500) {
      return 'Server error. Please try again later.';
    }
    
    // Validation error
    if (error?.status === 422 && error?.data?.errors) {
      const errorMessages = Object.values(error.data.errors)
        .flat()
        .join('. ');
      return errorMessages || 'Validation error. Please check your input.';
    }
    
    // Default error message
    return error?.message || 'Something went wrong. Please try again.';
  }

  /**
   * Handle API errors with common patterns
   * @param {Object} error - Error object from API call
   * @param {Function} onNetworkError - Callback for network errors
   * @param {Function} onAuthError - Callback for authentication errors
   * @param {Function} onServerError - Callback for server errors
   * @param {Function} onValidationError - Callback for validation errors
   * @param {Function} onDefaultError - Callback for other errors
   */
  static handleApiError(error, {
    onNetworkError,
    onAuthError,
    onServerError,
    onValidationError,
    onDefaultError,
  } = {}) {
    // Network connectivity error
    if (error?.isNetworkError) {
      if (onNetworkError) {
        onNetworkError(error);
        return;
      }
    }
    
    // Authentication error
    if (error?.status === 401) {
      if (onAuthError) {
        onAuthError(error);
        return;
      }
    }
    
    // Server error
    if (error?.status >= 500) {
      if (onServerError) {
        onServerError(error);
        return;
      }
    }
    
    // Validation error
    if (error?.status === 422 && error?.data?.errors) {
      if (onValidationError) {
        onValidationError(error);
        return;
      }
    }
    
    // Default error handler
    if (onDefaultError) {
      onDefaultError(error);
    }
  }

  /**
   * Subscribe to network status changes
   * @param {Function} callback - Callback function when network status changes
   * @returns {Function} - Unsubscribe function
   */
  static subscribeToNetworkChanges(callback) {
    return NetInfo.addEventListener(callback);
  }
}

export default NetworkUtils; 