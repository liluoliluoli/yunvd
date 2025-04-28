import {Platform} from 'react-native';
import {ENDPOINTS, STORAGE_KEYS} from '../utils/ApiConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetworkUtils from '../utils/NetworkUtils';
import ApiClient from "./ApiClient";


class ApiService {
    constructor() {
        this.apiClient = new ApiClient();
        this.isWeb = Platform.OS === 'web';
        console.log(`[VideoService] Initialized - Platform: ${Platform.OS}`);
    }

    async getLastAppVersion() {
        try {
            return await this.apiClient.post(ENDPOINTS.GET_LAST_APP_VERSION);
        } catch (error) {
            throw error;
        }
    }

    async register({userName, password, confirmPassword}) {
        try {
            return await this.apiClient.post(ENDPOINTS.REGISTER, {userName, password, confirmPassword});
        } catch (error) {
            throw error;
        }
    }

    async login(userName, password) {
        try {
            const response = await this.apiClient.post(ENDPOINTS.LOGIN, {userName, password});
            if (response && response.authorization) {
                await this.storeAuthData(response.authorization, userName);
                return true;
            }
            return false;
        } catch (error) {
            throw error;
        }
    }

    async logout() {
        try {
            await this.apiClient.post(ENDPOINTS.LOGOUT);
            await AsyncStorage.multiRemove([
                STORAGE_KEYS.AUTH_TOKEN,
                STORAGE_KEYS.USER_NAME,
            ]);
        } catch (error) {
            console.error('Error logout:', error);
        }
    }

    async profile() {
        try {
            return await this.apiClient.post(ENDPOINTS.PROFILE);
        } catch (error) {
            console.error('Error profile:', error);
            throw error;
        }
    }

    async watchCount() {
        try {
            return await this.apiClient.post(ENDPOINTS.WATCH_COUNT);
        } catch (error) {
            throw error;
        }
    }

    async updateFavorite(videoId, favorite) {
        try {
            return await this.apiClient.post(ENDPOINTS.UPDATE_FAVORITE, {videoId, favorite});
        } catch (error) {
            throw error;
        }
    }

    async updatePlayedStatus(updatePlayedStatusList) {
        try {
            return await this.apiClient.post(ENDPOINTS.UPDATE_PALAYED_STATUS, {
                updatePlayedStatusList
            });
        } catch (error) {
            throw error;
        }
    }

    async queryFavorites(page = {currentPage: 1, pageSize: 10}) {
        try {
            return await this.apiClient.post(ENDPOINTS.QUERY_FAVORITES, {page: page});
        } catch (error) {
            throw error;
        }
    }

    async searchVideos(page = {currentPage: 1, pageSize: 10}, search, sort, genre, region, year, videoType) {
        try {
            return await this.apiClient.post(ENDPOINTS.SEARCH_VIDEOS, {
                page: page,
                search,
                sort,
                genre,
                region,
                year,
                videoType
            });
        } catch (error) {
            throw error;
        }
    }

    async getVideo(id) {
        try {
            return await this.apiClient.post(ENDPOINTS.GET_VIDEO, {id});
        } catch (error) {
            throw error;
        }
    }

    async getEpisode(id) {
        try {
            return await this.apiClient.post(ENDPOINTS.GET_EPISODE, {id});
        } catch (error) {
            throw error;
        }
    }

    async isAuthenticated() {
        try {
            const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
            return !!token;
        } catch (error) {
            return false;
        }
    }

    async getUserName() {
        try {
            return await AsyncStorage.getItem(STORAGE_KEYS.USER_NAME);
        } catch (error) {
            return null;
        }
    }

    async storeAuthData(authorization, userName) {
        const storageItems = [
            [STORAGE_KEYS.AUTH_TOKEN, authorization],
            [STORAGE_KEYS.USER_NAME, userName],
        ];
        await AsyncStorage.multiSet(storageItems);
    }

}

// Export the class directly, not an instance
export default new ApiService();
