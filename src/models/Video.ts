import Episode from "./Episode";
import Actor from "./Actor";

export type Video = {
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
export default Video;

export type VideoReq = {
    video: Video,
    episodeId: number,
    domain: string,
    secretKey: string,
    token: string,
};
