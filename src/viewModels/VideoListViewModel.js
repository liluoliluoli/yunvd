import {useCallback, useState} from 'react';
import ApiService from '../services/ApiService';
import VideoItem from '../models/VideoItem';
import {PAGE_SIZE} from "../utils/ApiConstants";
import Toast from 'react-native-simple-toast';

export const useVideoListViewModel = () => {
    const [videos, setVideos] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
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
    const [isRefresh, setIsRefresh] = useState(false);
    const [favoriteCount, setFavoriteCount] = useState(0);

    const fetchSearchVideos = useCallback(async () => {
        try {
            console.log("hasMore:" + hasMore + ", isRefresh:" + isRefresh);
            if (!hasMore && !isRefresh) {
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
            if (isRefresh) {
                if (response.list && response.list.length > 0) {
                    setVideos(response.list);
                    setHasMore(true);
                } else {
                    setVideos([]);
                    setHasMore(false);
                    Toast.show("没有查到数据");
                }
            } else {
                if (response.list && response.list.length > 0) {
                    setVideos(prev => [...prev, ...response.list]);
                    setHasMore(true);
                } else {
                    setHasMore(false);
                    Toast.show("没有更多数据");
                }
            }
            setIsRefresh(prev => false);
        } catch (error) {
            console.error('Error searchVideos fetched:', error);
            setError(error.message || 'Failed to searchVideos fetched');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, hasMore, sort, search, videoType, isRefresh, region, year, genre]);


    const fetchFavoriteVideos = useCallback(async () => {
        try {
            if (!hasMore) {
                Toast.show("没有更多数据");
                return;
            }
            setIsLoading(true);
            setError(null);
            const response = await ApiService.queryFavorites({
                currentPage: currentPage, pageSize: PAGE_SIZE,
            });
            if (response.list && response.list.length > 0) {
                setVideos(prev => [...prev, ...response.list]);
                setHasMore(true);
                setFavoriteCount(response.page.count);
            } else {
                setHasMore(false);
                Toast.show("没有更多数据");
            }
        } catch (error) {
            console.error('Error fetchFavoriteVideos fetched:', error);
            setError(error.message || 'Failed to fetchFavoriteVideos fetched');
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
        setSearch,
        sort,
        setSort,
        genre,
        setGenre,
        region,
        setRegion,
        year,
        setYear,
        videoType,
        setVideoType,
        setIsHistory,
        fetchSearchVideos,
        setHasMore,
        setCurrentPage,
        hasMore,
        isRefresh,
        setIsRefresh,
        fetchFavoriteVideos,
        favoriteCount
    };
};
