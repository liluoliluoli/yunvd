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
export const YEAR_OPTIONS = [
    {key: "", label: "全部"},
    {key: "2015", label: "2015"},
    {key: "2016", label: "2016"},
    {key: "2017", label: "2017"},
    {key: "2018", label: "2018"},
    {key: "2019", label: "2019"},
    {key: "2020", label: "2020"},
    {key: "2021", label: "2021"},
    {key: "2022", label: "2022"},
    {key: "2023", label: "2023"},
    {key: "2024", label: "2024"},
    {key: "2025", label: "2025"}
]
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


