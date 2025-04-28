import {useCallback, useState} from 'react';
import ApiService from '../services/ApiService';
import VideoItem from '../models/VideoItem';
import {PAGE_SIZE} from "../utils/ApiConstants";
import Toast from 'react-native-simple-toast';

export const useEpisodeViewModel = () => {
    const [episode, setEpisode] = useState(null);
    const [episodeId, setEpisodeId] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);

    const fetchEpisode = useCallback(async () => {
        if (episodeId === 0) {
            return;
        }
        try {
            setIsLoading(true);
            setError(null);
            const response = await ApiService.getEpisode(episodeId);
            if (response) {
                setEpisode(response);
            }
        } catch (error) {
            console.error('Error fetchEpisode:', error);
            setError(error.message || 'Failed to fetchEpisode');
        } finally {
            setIsLoading(false);
        }
    }, [episodeId]);

    return {
        episode,
        setEpisode,
        episodeId,
        setEpisodeId,
        isLoading,
        error,
        fetchEpisode
    };
};
