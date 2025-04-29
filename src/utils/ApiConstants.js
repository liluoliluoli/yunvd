import {scaledPixels} from "../hooks/useScale";

export const API_BASE_URL = 'http://4d5d347e.cpolar.io';
export const API_PWD = "SDDSIOPOPPP";

export const ENDPOINTS = {
    GET_LAST_APP_VERSION: API_BASE_URL + '/api/version/getLastVersion',
    REGISTER: API_BASE_URL + '/api/user/create',
    LOGIN: API_BASE_URL + '/api/user/login',
    LOGOUT: API_BASE_URL + '/api/user/logout',
    PROFILE: '/api/user/get',
    WATCH_COUNT: API_BASE_URL + '/api/user/getCurrentWatchCount',
    UPDATE_FAVORITE: API_BASE_URL + '/api/user/updateFavorite',
    UPDATE_PALAYED_STATUS: API_BASE_URL + '/api/user/updatePlayedStatus',
    QUERY_FAVORITES: API_BASE_URL + '/api/user/queryFavorites',
    SEARCH_VIDEOS: API_BASE_URL + '/api/video/search',
    GET_VIDEO: API_BASE_URL + '/api/video/get',
    GET_EPISODE: API_BASE_URL + '/api/episode/get',
};

export const STATUS_CODES = {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    VALIDATION_ERROR: 422,
    SERVER_ERROR: 500,
};

export const REQUEST_TIMEOUT = 30000;

export const PAGE_SIZE = 10;

export const HEADER_SIZE = scaledPixels(400);

// API headers
export const DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
};

// Local storage keys
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'Authorization',
    USER_NAME: 'UserName',
    WATCH_HISTORY: 'WatchHistory',
};

export const SORT_OPTIONS = [
    {key: "", label: "全部"},
    {key: "publish", label: "最新"},
    {key: "hot", label: "最热"},
    {key: "rate", label: "好评"}
]
export const GENRE_OPTIONS = [
    {key: "", label: "全部"},
    {key: "爱情", label: "爱情"},
    {key: "古装", label: "古装"},
    {key: "悬疑", label: "悬疑"},
    {key: "都市", label: "都市"},
    {key: "喜剧", label: "喜剧"}
]
export const REGION_OPTIONS = [
    {key: "", label: "全部"},
    {key: "大陆", label: "大陆"},
    {key: "香港", label: "香港"},
    {key: "台湾", label: "台湾"},
    {key: "日本", label: "日本"},
    {key: "美国", label: "美国"}
]

function generateRecentYears(n) {
    const currentYear = new Date().getFullYear();
    return Array.from({length: n}, (_, index) => ({
        key: String(currentYear - index),
        label: String(currentYear - index)
    }));
}

export const YEAR_OPTIONS = generateRecentYears(10)
YEAR_OPTIONS.unshift({key: "", label: "全部"})
export const TAB_ROUTES = [
    {key: 'history', title: '播放历史', screen: 'Home'},
    {key: 'movies', title: '电影', screen: 'Movie'},
    {key: 'tvSeries', title: '电视剧', screen: 'TvSeries'},
    {key: 'tvShows', title: '综艺', screen: 'TvShow'},
    {key: 'record', title: '记录', screen: 'Record'},
];

export const VT_MOVIE = 'movie';
export const VT_TV_SERIES = 'tvSeries';
export const VT_TV_SHOWS = 'tvShows';
export const VT_RECORD = 'record';


export const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export const formatToYMD = (timestamp) => {
    if (!timestamp || timestamp === 0) {
        return '无';
    }
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
