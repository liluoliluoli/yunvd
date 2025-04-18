import {useState, useEffect, useCallback, useRef} from 'react';
import VideoService from '../services/VideoService';
import Video from '../models/VideoItem';
import NetworkUtils from '../utils/NetworkUtils';
import {Platform} from 'react-native';

/**
 * VideoItem player view model hook for managing video playback and related data
 * @param {string} initialVideoId - Initial video ID to load
 * @param {Object} passedVideo - Complete video object passed from navigation (optional)
 * @returns {Object} - VideoItem player state and methods
 */
const useVideoPlayerViewModel = (initialVideoId = null, passedVideo = null) => {
    // Current video and loading state
    const [currentVideo, setCurrentVideo] = useState(passedVideo || null);
    const [isLoading, setIsLoading] = useState(!passedVideo);
    const [error, setError] = useState(null);

    // Related videos
    const [relatedVideos, setRelatedVideos] = useState([]);
    const [relatedLoading, setRelatedLoading] = useState(false);
    const [relatedError, setRelatedError] = useState(null);

    // Comments
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentsError, setCommentsError] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [isPostingComment, setIsPostingComment] = useState(false);

    // Playback state
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [buffering, setBuffering] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const [selectedQuality, setSelectedQuality] = useState('auto');

    // Player references
    const playerRef = useRef(null);

    // Load video on component mount or ID change
    useEffect(() => {
        if (passedVideo) {
            // If we already have the video data, just load related content
            console.log('Using passed video data:', passedVideo.title);
            loadRelatedVideos(passedVideo.id);
            loadComments(passedVideo.id);
        } else if (initialVideoId) {
            // Otherwise fetch everything using the ID
            loadVideo(initialVideoId);
        }
    }, [initialVideoId, passedVideo]);

    /**
     * Load a video by ID
     * @param {string} videoId - VideoItem ID to load
     * @returns {Promise<void>}
     */
    const loadVideo = useCallback(async (videoId) => {
        try {
            setIsLoading(true);
            setError(null);

            // Get video details
            let video;
            try {
                const videoData = await VideoService.getVideoDetails(videoId);
                video = new Video(videoData);
            } catch (error) {
                console.error('Error fetching video details, trying fallback:', error);

                // Try fallback for web platform
                if (Platform.OS === 'web') {
                    const mockVideos = VideoService.getMockVideos();
                    const mockVideo = mockVideos.find(v => v.id === videoId) || mockVideos[0];
                    if (mockVideo) {
                        console.log('Using mock video as fallback:', mockVideo.title);
                        video = mockVideo;
                    } else {
                        throw error; // Re-throw if no fallback available
                    }
                } else {
                    throw error;
                }
            }

            setCurrentVideo(video);

            // Reset playback state
            setCurrentTime(0);
            setDuration(parseFloat(video.duration) || 0);

            // Load related content in parallel
            await Promise.all([
                loadRelatedVideos(videoId),
                loadComments(videoId)
            ]);
        } catch (error) {
            console.error('VideoItem load error:', error);
            setError(NetworkUtils.getErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    }, [loadRelatedVideos, loadComments]);

    /**
     * Load related videos for the current video
     * @param {string} videoId - VideoItem ID to find related videos for
     */
    const loadRelatedVideos = useCallback(async (videoId) => {
        try {
            setRelatedLoading(true);
            setRelatedError(null);

            // Get related videos from API
            const videos = await VideoService.getRelatedVideos(videoId);
            setRelatedVideos(Array.isArray(videos) ? videos : []);

            console.log(`Loaded ${videos?.length || 0} related videos`);
        } catch (error) {
            console.error('Error loading related videos:', error);
            const errorMsg = NetworkUtils.getErrorMessage(error);
            setRelatedError(errorMsg);

            // Fallback mock data for web testing
            if (Platform.OS === 'web') {
                const mockRelated = VideoService.getMockVideos().filter(v => v.id !== videoId).slice(0, 3);
                setRelatedVideos(mockRelated);
                console.log('Using mock related videos as fallback');
            } else {
                // Ensure relatedVideos is set to an empty array in case of error
                setRelatedVideos([]);
            }
        } finally {
            setRelatedLoading(false);
        }
    }, []);

    /**
     * Load comments for the current video
     * @param {string} videoId - VideoItem ID to get comments for
     */
    const loadComments = useCallback(async (videoId) => {
        try {
            setCommentsLoading(true);
            setCommentsError(null);

            // Get comments from API
            const videoComments = await VideoService.getVideoComments(videoId);
            setComments(Array.isArray(videoComments) ? videoComments : []);

            console.log(`Loaded ${videoComments?.length || 0} comments`);
        } catch (error) {
            console.error('Error loading comments:', error);
            const errorMsg = NetworkUtils.getErrorMessage(error);
            setCommentsError(errorMsg);

            // Fallback mock data for web testing
            if (Platform.OS === 'web') {
                const mockComments = [
                    {
                        id: '1',
                        userId: 'user1',
                        username: 'VideoFan',
                        text: 'Great video!',
                        timestamp: new Date().toISOString()
                    },
                    {
                        id: '2',
                        userId: 'user2',
                        username: 'FilmBuff',
                        text: 'I enjoyed the content, thanks for sharing.',
                        timestamp: new Date().toISOString()
                    }
                ];
                setComments(mockComments);
                console.log('Using mock comments as fallback');
            } else {
                // Ensure comments is set to an empty array in case of error
                setComments([]);
            }
        } finally {
            setCommentsLoading(false);
        }
    }, []);

    /**
     * Add a comment to the current video
     * @returns {Promise<boolean>} - Success indicator
     */
    const addComment = async () => {
        if (!currentVideo?.id || !commentText.trim()) {
            return false;
        }

        try {
            setIsPostingComment(true);

            await VideoService.addComment(currentVideo.id, commentText.trim());

            // Reload comments to include the new one
            await loadComments(currentVideo.id);

            // Clear comment text
            setCommentText('');

            return true;
        } catch (error) {
            console.log('Add comment error:', error);
            setCommentsError(NetworkUtils.getErrorMessage(error));
            return false;
        } finally {
            setIsPostingComment(false);
        }
    };

    /**
     * Toggle like status for current video
     * @returns {Promise<boolean>} - New like status
     */
    const toggleLike = async () => {
        if (!currentVideo?.id) {
            return false;
        }

        try {
            const isCurrentlyLiked = currentVideo.isLiked;

            // Optimistically update UI
            setCurrentVideo(prev => {
                if (!prev) return prev;
                return new Video({
                    ...prev.serialize(),
                    is_liked: !isCurrentlyLiked,
                    likes: isCurrentlyLiked ? prev.likes - 1 : prev.likes + 1
                });
            });

            // Make API call
            if (isCurrentlyLiked) {
                await VideoService.unlikeVideo(currentVideo.id);
            } else {
                await VideoService.likeVideo(currentVideo.id);
            }

            return !isCurrentlyLiked;
        } catch (error) {
            console.log('Toggle like error:', error);

            // Revert optimistic update on error
            setCurrentVideo(prev => {
                if (!prev) return prev;
                return new Video({
                    ...prev.serialize(),
                    is_liked: currentVideo.isLiked,
                    likes: currentVideo.likes
                });
            });

            return currentVideo.isLiked;
        }
    };

    /**
     * Toggle watchlist status for current video
     * @returns {Promise<boolean>} - New watchlist status
     */
    const toggleWatchlist = async () => {
        if (!currentVideo?.id) {
            return false;
        }

        try {
            const isCurrentlyInWatchlist = currentVideo.isInWatchlist;

            // Optimistically update UI
            setCurrentVideo(prev => {
                if (!prev) return prev;
                return new Video({
                    ...prev.serialize(),
                    is_in_watchlist: !isCurrentlyInWatchlist
                });
            });

            // Make API call
            if (isCurrentlyInWatchlist) {
                await VideoService.removeFromWatchlist(currentVideo.id);
            } else {
                await VideoService.addToWatchlist(currentVideo.id);
            }

            return !isCurrentlyInWatchlist;
        } catch (error) {
            console.log('Toggle watchlist error:', error);

            // Revert optimistic update on error
            setCurrentVideo(prev => {
                if (!prev) return prev;
                return new Video({
                    ...prev.serialize(),
                    is_in_watchlist: currentVideo.isInWatchlist
                });
            });

            return currentVideo.isInWatchlist;
        }
    };

    /**
     * Rate the current video
     * @param {number} rating - Rating value (1-5)
     * @returns {Promise<boolean>} - Success indicator
     */
    const rateVideo = async (rating) => {
        if (!currentVideo?.id) {
            return false;
        }

        try {
            await VideoService.rateVideo(currentVideo.id, rating);

            // Update current video with new rating
            setCurrentVideo(prev => {
                if (!prev) return prev;
                return new Video({
                    ...prev.serialize(),
                    rating
                });
            });

            return true;
        } catch (error) {
            console.log('Rate video error:', error);
            return false;
        }
    };

    /**
     * Update playback progress
     * @param {number} time - Current time in seconds
     * @returns {void}
     */
    const updateProgress = (time) => {
        setCurrentTime(time);

        // Store progress in local storage or server
        if (currentVideo?.id) {
            storeProgress(time);
        }
    };

    /**
     * Store playback progress for the current video
     * @param {number} time - Current time in seconds
     * @returns {void}
     */
    const storeProgress = useCallback(
        debounce((time) => {
            if (!currentVideo?.id) return;

            // Calculate progress percentage
            const progressPercent = (time / duration) * 100;

            // Store progress in service
            VideoService.addToWatchHistory(currentVideo.id)
                .catch(error => console.log('Error storing progress:', error));
        }, 2000),
        [currentVideo?.id, duration]
    );

    /**
     * Play or pause video
     * @returns {void}
     */
    const togglePlay = () => {
        if (playerRef.current) {
            if (isPlaying) {
                playerRef.current.pause();
            } else {
                playerRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    /**
     * Toggle mute state
     * @returns {void}
     */
    const toggleMute = () => {
        if (playerRef.current) {
            playerRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    /**
     * Toggle fullscreen mode
     * @returns {void}
     */
    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    /**
     * Seek to a specific time
     * @param {number} time - Time in seconds
     * @returns {void}
     */
    const seekTo = (time) => {
        if (playerRef.current) {
            playerRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    /**
     * Change playback rate
     * @param {number} rate - Playback rate
     * @returns {void}
     */
    const changePlaybackRate = (rate) => {
        if (playerRef.current) {
            playerRef.current.playbackRate = rate;
            setPlaybackRate(rate);
        }
    };

    /**
     * Change video quality
     * @param {string} quality - Quality setting
     * @returns {void}
     */
    const changeQuality = (quality) => {
        setSelectedQuality(quality);
    };

    /**
     * Format current playback time
     * @returns {string} - Formatted time (mm:ss/mm:ss)
     */
    const getFormattedTime = () => {
        const formatTime = (seconds) => {
            const minutes = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        };

        return `${formatTime(currentTime)} / ${formatTime(duration)}`;
    };

    /**
     * Get playback progress percentage
     * @returns {number} - Progress percentage (0-100)
     */
    const getProgressPercentage = () => {
        if (duration === 0) return 0;
        return (currentTime / duration) * 100;
    };

    // Helper function for debouncing
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    return {
        // VideoItem data
        currentVideo,
        relatedVideos,
        comments,

        // Loading states
        isLoading,
        relatedLoading,
        commentsLoading,
        isPostingComment,

        // Errors
        error,
        relatedError,
        commentsError,

        // Playback state
        isPlaying,
        setIsPlaying,
        isMuted,
        setIsMuted,
        isFullscreen,
        currentTime,
        duration,
        buffering,
        playbackRate,
        selectedQuality,

        // Comment state
        commentText,
        setCommentText,

        // Player ref
        playerRef,

        // Methods
        loadVideo,
        loadRelatedVideos,
        loadComments,
        addComment,
        toggleLike,
        toggleWatchlist,
        rateVideo,
        togglePlay,
        toggleMute,
        toggleFullscreen,
        seekTo,
        updateProgress,
        changePlaybackRate,
        changeQuality,
        getFormattedTime,
        getProgressPercentage,
    };
};

export default useVideoPlayerViewModel;
