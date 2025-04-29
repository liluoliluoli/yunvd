import {useCallback, useState} from 'react';
import ApiService from '../services/ApiService';
import VideoItem from '../models/VideoItem';
import {PAGE_SIZE} from "../utils/ApiConstants";
import Toast from 'react-native-simple-toast';

export const useVideoItemViewModel = () => {
    const [video, setVideo] = useState(null);
    const [videoId, setVideoId] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);

    const fetchVideo = useCallback(async () => {
        if (videoId === 0) {
            return;
        }
        try {
            setIsLoading(true);
            setError(null);
            const response = await ApiService.getVideo(videoId);
            if (response) {
                setVideo(response);
            }
        } catch (error) {
            console.error('Error fetchVideo:', error);
            setError(error.message || 'Failed to fetchVideo');
        } finally {
            setIsLoading(false);
        }
    }, [videoId]);

    const updateFavorite = useCallback(async () => {
        if (videoId === 0) {
            return;
        }
        try {
            setIsLoading(true);
            setError(null);
            await ApiService.updateFavorite(videoId, !isFavorite);
        } catch (error) {
            console.error('Error updateFavorite:', error);
            setError(error.message || 'Failed to updateFavorite');
        } finally {
            setIsLoading(false);
        }
    }, [videoId]);

    return {
        video,
        videoId,
        setVideoId,
        isLoading,
        error,
        fetchVideo,
        isFavorite,
        setIsFavorite,
        updateFavorite,
    };
};
