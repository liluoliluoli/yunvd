import {scaledPixels} from "../hooks/useScale";
import moment from "moment";

export let API_BASE_URL = 'https://1bd6-219-76-131-16.ngrok-free.app';
export const API_PWD = "SDDSIOPOPPP";

export const initApiBaseUrl = async () => {
    try {
        const response = await fetch('https://gitee.com/enjoula/VideoInfo/raw/master/video.txt');
        const text = await response.text();
        const jsonData = JSON.parse(text);

        // 测试URL可用性并选择第一个可用的
        const urls = [jsonData.URL1, jsonData.URL2, jsonData.URL3];
        for (const url of urls) {
            try {
                console.log(`URL ${url} to request`);
                const testResponse = await fetch(`${url}/api/version/getLastVersion`, {
                    method: 'GET',
                    timeout: 3000
                });
                console.log(`URL ${url} to response` + testResponse.ok);
                if (testResponse.ok) {
                    API_BASE_URL = url;
                    break;
                }
            } catch (e) {
                console.log(`URL ${url} not available`);
            }
        }

        // 更新所有ENDPOINTS
        Object.keys(ENDPOINTS).forEach(key => {
            ENDPOINTS[key] = API_BASE_URL + ENDPOINTS[key].replace(/^https?:\/\/[^\/]+/, '');
        });
        console.log('Updated ENDPOINTS:', JSON.stringify(ENDPOINTS, null, 2));
    } catch (error) {
        console.error('Failed to fetch server config:', error);
    }
};

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
    {key: 'home', title: '首页', screen: 'Home'},
    {key: 'movies', title: '电影', screen: 'Movie'},
    {key: 'tvSeries', title: '电视剧', screen: 'TvSeries'},
    {key: 'cartoon', title: '动画', screen: 'Cartoon'},
    {key: 'tvShows', title: '综艺', screen: 'TvShow'},
    {key: 'record', title: '记录', screen: 'Record'},
];

export const VT_MOVIE = 'movie';
export const VT_TV_SERIES = 'tvSeries';
export const VT_CARTOON = 'cartoon';
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
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export const formatFriendlyTime = (timestamp) => {
    const time = new Date(timestamp * 1000);
    return moment(time).calendar(null, {
        sameDay: '[今天] HH:mm',      // 今天 10:30
        lastDay: '[昨天] HH:mm',      // 昨天 15:45
        lastWeek: 'MM月DD日 HH:mm',   // 5月10日 09:20
        sameElse: 'YYYY年MM月DD日 HH:mm', // 2024年5月1日 14:30
    });
}
