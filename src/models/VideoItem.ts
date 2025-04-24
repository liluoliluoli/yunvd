import Episode from "./Episode";
import Subtitle from "./Subtitle";

export type VideoItem = {
    id: number,
    title: string,
    description: string,
    thumbnail: string,
    duration: string,
    views: number,
    likes: number,
    directors: string[]
    actors: string[]
    genres: string[]
    region: string
    year: string
    isFavorite: boolean
    rating: number
    publishDate: string,
    episodeCount: number
    episodes: Episode[]
};
export default VideoItem;
