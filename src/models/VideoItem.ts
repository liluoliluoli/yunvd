import Episode from "./Episode";
import Actor from "./Actor";

export type VideoItem = {
    id: number,
    title: string,
    videoType: string,
    voteRate: number,
    voteCount: number,
    region: string,
    totalEpisode: number,
    description: string,
    publishMonth: string,
    thumbnail: string,
    directors: string[]
    actors: Actor[]
    genres: string[]
    episodes: Episode[]
    ratio: string
    lastPlayedTime: number
    isFavorite: boolean
    lastPlayedEpisodeId: number
    lastPlayedPosition: number
};
export default VideoItem;
