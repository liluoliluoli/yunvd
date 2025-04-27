import {scaledPixels} from "../hooks/useScale";

export const API_BASE_URL = 'http://59565ef5.cpolar.io';

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
export const GENRE_OPTIONS = ["", "爱情", "古装", "悬疑", "都市", "喜剧"]
export const REGION_OPTIONS = ["", "大陆", "香港", "台湾", "日本", "韩国", "美国"]
const currentYear = new Date().getFullYear();
export const YEAR_OPTIONS = Array.from({length: 10}, (_, i) => (currentYear - i).toString());
YEAR_OPTIONS.unshift("")
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


