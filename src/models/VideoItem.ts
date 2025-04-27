import Episode from "./Episode";

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
    actors: string[]
    genres: string[]
    episodes: Episode[]
    ratio: string
};
export default VideoItem;
