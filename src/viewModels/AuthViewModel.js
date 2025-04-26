import {useCallback, useEffect, useState} from 'react';
import apiService from '../services/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../utils/ApiConstants';
import {Platform} from 'react-native';

const webStorage = {
    _data: {},
    setItem: function (key, value) {
        console.log(`[Web Storage] Setting ${key}`);
        this._data[key] = value;
        return Promise.resolve();
    },
    getItem: function (key) {
        console.log(`[Web Storage] Getting ${key}`);
        return Promise.resolve(this._data[key] || null);
    },
    removeItem: function (key) {
        console.log(`[Web Storage] Removing ${key}`);
        delete this._data[key];
        return Promise.resolve();
    }
};

// Use AsyncStorage on native, webStorage on web
const storage = Platform.OS === 'web' ? webStorage : AsyncStorage;

export const useAuthViewModel = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userName, setUserName] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        console.log('AuthViewModel initialized');
        checkAuthStatus().catch(err => {
            console.error('Auth check failed:', err);
        });
    }, []);

    const checkAuthStatus = useCallback(async () => {
        try {
            setIsLoading(true);
            const authorization = await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
            console.log('User authorization:', authorization ? 'Found' : 'Not found');
            if (authorization) {
                const userName = await storage.getItem(STORAGE_KEYS.USER_NAME);
                console.log('User userName:', userName ? 'Found' : 'Not found');

                if (userName) {
                    setUserName(userName);
                    console.log('User loaded:', userName);
                }
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

    const fetchUserProfile = async () => {
        try {
            const profileData = await apiService.profile();
            if (profileData && profileData.userName) {
                setUserName(profileData.userName);
                await storage.setItem(STORAGE_KEYS.USER_NAME, profileData.userName);
            }
        } catch (error) {
            console.log('Error fetching user profile:', error);
            if (error.status === 401) {
                await logout();
            }
        }
    };

    const login = useCallback(async (userName, password) => {
        try {
            console.log('Login userName:', userName);
            setIsLoading(true);
            clearError();
            const response = await apiService.login(userName, password);
            if (response) {
                setIsAuthenticated(true);
                console.log('Login successful');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            setError('Login failed. Please check your credentials and try again.');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [clearError]);

    const register = useCallback(async (userName, password, confirmPassword) => {
        try {
            console.log('Registering userName:', userName);
            setIsLoading(true);
            clearError();
            const response = await apiService.register(userName, password, confirmPassword);
            if (response) {
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


    const logout = useCallback(async () => {
        try {
            console.log('Logout');
            setIsLoading(true);
            const response = await apiService.logout();
            if (response) {
                await storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
                await storage.removeItem(STORAGE_KEYS.USER_NAME);
            }
            setIsAuthenticated(false);
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

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        isLoading,
        isAuthenticated,
        error,
        login,
        register,
        logout,
        clearError,
        checkAuthStatus
    };
};

