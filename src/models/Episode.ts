import Subtitle from "./Subtitle";

export type Episode = {
    id: number,
    episode: string,
    videoUrl: string,
    subtitles?: Subtitle[]
};
export default Episode;
