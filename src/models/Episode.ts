import Subtitle from "./Subtitle";

export type Episode = {
    id: number,
    videoId: number,
    episode: number,
    episodeTitle: string,
    url: string,
    duration: number,
    platform: string,
    subtitles?: Subtitle[]
};
export default Episode;
