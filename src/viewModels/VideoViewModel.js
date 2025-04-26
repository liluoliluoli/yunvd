import {useCallback, useState} from 'react';
import ApiService from '../services/ApiService';
import VideoItem from '../models/VideoItem';
import {PAGE_SIZE} from "../utils/ApiConstants";
import Toast from 'react-native-simple-toast';

export const useVideoViewModel = () => {
    const [videos, setVideos] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState(null);
    const [sort, setSort] = useState(null);
    const [genre, setGenre] = useState(null);
    const [region, setRegion] = useState(null);
    const [year, setYear] = useState(null);
    const [videoType, setVideoType] = useState(null);
    const [isHistory, setIsHistory] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const fetchSearchVideos = useCallback(async () => {
        try {
            if (!hasMore) {
                Toast.show("没有更多数据");
                return;
            }
            setIsLoading(true);
            setError(null);
            const response = await ApiService.searchVideos({
                    currentPage: currentPage, pageSize: PAGE_SIZE,
                },
                search,
                sort,
                genre,
                region,
                year,
                videoType,
                isHistory,);
            if (response.list && response.list.length > 0) {
                setVideos(prev => [...prev, ...response.list]);
                setCurrentPage(prev => prev + 1);
                console.log("2")
            } else {
                console.log("1")
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error searchVideos fetched:', error);
            setError(error.message || 'Failed to searchVideos fetched');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, hasMore]);

    return {
        videos,
        setVideos,
        isLoading,
        error,
        currentPage,
        search,
        sort,
        genre,
        region,
        year,
        videoType,
        setIsHistory,
        fetchSearchVideos,
    };
};
