import React, {useEffect, useState} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {BottomArrow, TopArrow} from "../components/Arrows";
import {SpatialNavigationScrollView} from "react-tv-space-navigation";
import {scaledPixels} from "../hooks/useScale";
import {Page} from "../components/Page";
import {theme} from "../theme/theme";
import chunk from 'lodash/chunk';
import VideoItem from "../models/VideoItem";
import {TAB_ROUTES} from "../utils/ApiConstants";
import {Header} from "../components/Header";
import {TabBar} from "../components/Tabbar";
import {VideoList} from "../components/VideoList";
import {UpdateProvider} from "../components/UpdateContext";

const HEADER_SIZE = scaledPixels(400)
export default function HomeScreen({route, navigation}) {
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [videosByRow, setVideosByRow] = useState<VideoItem[][]>([]);
    const [filteredVideos, setFilteredVideos] = useState<VideoItem[]>([]);
    const [isLoadingMockData, setIsLoadingMockData] = useState(true);
    const [mockError, setMockError] = useState(null);
    const [down, setDown] = useState(false);
    const loadVideos = async () => {
        try {
            setIsLoadingMockData(true);
            setMockError(null);
            const mockVideos: VideoItem[] = [
                {
                    id: 1,
                    title: 'Big Buck Bunny1',
                    description: 'Big Buck Bunny tells the story of a giant rabbit with a heart bigger than himself.',
                    thumbnail: 'https://peach.blender.org/wp-content/uploads/title_anouncement.jpg',
                    duration: '9:56',
                    views: 10482,
                    likes: 849,
                    directors: ['Blender Foundation'],
                    actors: ['Blender', 'Foundation', 'ket', 'Blender', 'Foundation', 'ket'],
                    genres: ['喜剧', '动作'],
                    region: 'US',
                    year: '2025',
                    isFavorite: false,
                    rating: 4.8,
                    publishDate: '2008-05-20',
                    episodeCount: 20,
                    episodes: [{
                        id: 1,
                        episode: "第1集",
                        videoUrl: 'https://cn-beijing-data.aliyundrive.net/603ef115f66180ba7a654401ad1aa8c89c950f99%2F603ef1152ff48627f4594e52a718b5199303c4df?callback=eyJjYWxsYmFja1VybCI6Imh0dHA6Ly9iajI5LmFwaS1ocC5hbGl5dW5wZHMuY29tL3YyL2ZpbGUvZG93bmxvYWRfY2FsbGJhY2siLCJjYWxsYmFja0JvZHkiOiJodHRwSGVhZGVyLnJhbmdlPSR7aHR0cEhlYWRlci5yYW5nZX1cdTAwMjZidWNrZXQ9JHtidWNrZXR9XHUwMDI2b2JqZWN0PSR7b2JqZWN0fVx1MDAyNmRvbWFpbl9pZD0ke3g6ZG9tYWluX2lkfVx1MDAyNnVzZXJfaWQ9JHt4OnVzZXJfaWR9XHUwMDI2ZHJpdmVfaWQ9JHt4OmRyaXZlX2lkfVx1MDAyNmZpbGVfaWQ9JHt4OmZpbGVfaWR9XHUwMDI2cGRzX3BhcmFtcz0ke3g6cGRzX3BhcmFtc31cdTAwMjZ2ZXJzaW9uPSR7eDp2ZXJzaW9ufSIsImNhbGxiYWNrQm9keVR5cGUiOiJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQiLCJjYWxsYmFja1N0YWdlIjoiYmVmb3JlLWV4ZWN1dGUiLCJjYWxsYmFja0ZhaWx1cmVBY3Rpb24iOiJpZ25vcmUifQ%3D%3D&callback-var=eyJ4OmRvbWFpbl9pZCI6ImJqMjkiLCJ4OnVzZXJfaWQiOiJiNzc5NGRlZTc5M2M0MmM2YmY1MmZkNDg3NDJkMmNlNyIsIng6ZHJpdmVfaWQiOiI5NzgwODgxODMiLCJ4OmZpbGVfaWQiOiI2ODA3OTViMTY5YjVhOGU3NjM2NTQzMDBiMTI0MWNkOTU3Mzc0OThjIiwieDpwZHNfcGFyYW1zIjoie1wiYXBcIjpcIjc2OTE3Y2NjY2Q0NDQxYzM5NDU3YTA0ZjYwODRmYjJmXCJ9IiwieDp2ZXJzaW9uIjoidjMifQ%3D%3D&di=bj29&dr=978088183&f=680795b169b5a8e763654300b1241cd95737498c&pds-params=%7B%22ap%22%3A%2276917ccccd4441c39457a04f6084fb2f%22%7D&response-content-disposition=attachment%3B%20filename%2A%3DUTF-8%27%27007%25E4%25B9%258B%25E4%25B8%2580.%25E8%25AF%25BA%25E5%258D%259A%25E5%25A3%25AB.Dr.No.1962.mkv&security-token=CAISvgJ1q6Ft5B2yfSjIr5XdBv3uoK145PebUB%2Fikkw0XchCu479mzz2IHhMf3NpBOkZvvQ1lGlU6%2Fcalq5rR4QAXlDfNSznE1rZq1HPWZHInuDox55m4cTXNAr%2BIhr%2F29CoEIedZdjBe%2FCrRknZnytou9XTfimjWFrXWv%2Fgy%2BQQDLItUxK%2FcCBNCfpPOwJms7V6D3bKMuu3OROY6Qi5TmgQ41Uh1jgjtPzkkpfFtkGF1GeXkLFF%2B97DRbG%2FdNRpMZtFVNO44fd7bKKp0lQLs0ARrv4r1fMUqW2X543AUgFLhy2KKMPY99xpFgh9a7j0iCbSGyUu%2FhcRm5sw9%2Byfo34lVYne0zMK0i2bi4IClLcc%2BmqdsRIvJzWstJ7Gf9LWqChvSgk4TxhhcNFKSTQrInFCB0%2BcRObJl16iutOUkvXtuMkagAEbl4AC7bFKb044Z%2F4aVdgexKG6Dd7Vcbx7w8xhBkBPvCWgAzPBxXdKrfBUXugwQJzMBVkXei%2FLA%2BPzYlNz9JcnE65tdpfX%2FkNriPxWF2tbHpvZGjBtveTVaP0Cw8vOPHC48GeBl8Oo5VOhWV7OwoqMX60oy39Y7TvMAZgwSVR4BSAA&u=b7794dee793c42c6bf52fd48742d2ce7&x-oss-access-key-id=STS.NVhMGZMrYS5pR9SvLaQGnTKVy&x-oss-expires=1745341839&x-oss-signature=PxDYPUb32jnajj6CTdAneX4tlU59484HFMwhbAJoTCo%3D&x-oss-signature-version=OSS2',
                    }, {
                        id: 2,
                        episode: "第2集",
                        videoUrl: 'https://cn-beijing-data.aliyundrive.net/5fcc45cdc4b124edc51543b98f597736afa81572%2F5fcc45cdcfe3f0b1dab44b6c968c9167d34d62bc?callback=eyJjYWxsYmFja1VybCI6Imh0dHA6Ly9iajI5LmFwaS1ocC5hbGl5dW5wZHMuY29tL3YyL2ZpbGUvZG93bmxvYWRfY2FsbGJhY2siLCJjYWxsYmFja0JvZHkiOiJodHRwSGVhZGVyLnJhbmdlPSR7aHR0cEhlYWRlci5yYW5nZX1cdTAwMjZidWNrZXQ9JHtidWNrZXR9XHUwMDI2b2JqZWN0PSR7b2JqZWN0fVx1MDAyNmRvbWFpbl9pZD0ke3g6ZG9tYWluX2lkfVx1MDAyNnVzZXJfaWQ9JHt4OnVzZXJfaWR9XHUwMDI2ZHJpdmVfaWQ9JHt4OmRyaXZlX2lkfVx1MDAyNmZpbGVfaWQ9JHt4OmZpbGVfaWR9XHUwMDI2cGRzX3BhcmFtcz0ke3g6cGRzX3BhcmFtc31cdTAwMjZ2ZXJzaW9uPSR7eDp2ZXJzaW9ufSIsImNhbGxiYWNrQm9keVR5cGUiOiJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQiLCJjYWxsYmFja1N0YWdlIjoiYmVmb3JlLWV4ZWN1dGUiLCJjYWxsYmFja0ZhaWx1cmVBY3Rpb24iOiJpZ25vcmUifQ%3D%3D&callback-var=eyJ4OmRvbWFpbl9pZCI6ImJqMjkiLCJ4OnVzZXJfaWQiOiJiNzc5NGRlZTc5M2M0MmM2YmY1MmZkNDg3NDJkMmNlNyIsIng6ZHJpdmVfaWQiOiI5NzgwODgxODMiLCJ4OmZpbGVfaWQiOiI2ODA3OWRjNDEzZTVjNWMyYTg1YjQ5ZjBiYTIwZDg5NGI4Nzk0YmU3IiwieDpwZHNfcGFyYW1zIjoie1wiYXBcIjpcIjc2OTE3Y2NjY2Q0NDQxYzM5NDU3YTA0ZjYwODRmYjJmXCJ9IiwieDp2ZXJzaW9uIjoidjMifQ%3D%3D&di=bj29&dr=978088183&f=68079dc413e5c5c2a85b49f0ba20d894b8794be7&pds-params=%7B%22ap%22%3A%2276917ccccd4441c39457a04f6084fb2f%22%7D&response-content-disposition=attachment%3B%20filename%2A%3DUTF-8%27%27X%25E6%2588%2598%25E8%25AD%25A61.%25E8%25B6%2585%25E6%25B8%2585%25E5%259B%25BD%25E8%258B%25B1%25E5%258F%258C%25E8%25AF%25AD%25E4%25B8%25AD%25E8%258B%25B1%25E5%258F%258C%25E5%25AD%2597.mkv&security-token=CAISvgJ1q6Ft5B2yfSjIr5XBPuzQprRChJGBQGDcgEQPQb0ao6bmqjz2IHhMf3NpBOkZvvQ1lGlU6%2Fcalq5rR4QAXlDfNTXtQ1nZq1HPWZHInuDox55m4cTXNAr%2BIhr%2F29CoEIedZdjBe%2FCrRknZnytou9XTfimjWFrXWv%2Fgy%2BQQDLItUxK%2FcCBNCfpPOwJms7V6D3bKMuu3OROY6Qi5TmgQ41Uh1jgjtPzkkpfFtkGF1GeXkLFF%2B97DRbG%2FdNRpMZtFVNO44fd7bKKp0lQLs0ARrv4r1fMUqW2X543AUgFLhy2KKMPY99xpFgh9a7j0iCbSGyUu%2FhcRm5sw9%2Byfo34lVYneo7pH0htv7uHwufJ7FxfIREfquk63pvSlHLcLPe0Kjzzleo2k1XRPVFF%2B535IaHXuToXDnvSiBM2j8PXtuMkagAFj51hAvYMywMGKKjxKCPwNn1%2BIMjBb7LoUycMgUaBhBJdy%2FdRNdGVE%2BTg1f2HxEcq5Mm0%2BRUky0gPUvC0rhgSK5EMWULUi%2FUVyA9EPYJJCOTMR%2B0OQ3bA5AE8gXpeiKanLJ8H1XpxEmEfrucO63Emrm9hyyMN9tO0r0TnTLUYkxiAA&u=b7794dee793c42c6bf52fd48742d2ce7&x-oss-access-key-id=STS.NVtuVdKkc3SjBFmdDZM26LcMH&x-oss-expires=1745343906&x-oss-signature=e6bKRsOb7WzL54SMHuaSEiVQEVv0VxNH6QRh3Eact%2F8%3D&x-oss-signature-version=OSS2',
                    }],

                }, {
                    id: 2,
                    title: 'BigBuckBunny and ElephantsDream',
                    description: 'Big Buck Bunny tells the story of a giant rabbit with a heart bigger than himself.',
                    thumbnail: 'https://peach.blender.org/wp-content/uploads/title_anouncement.jpg',
                    duration: '9:56',
                    views: 10482,
                    likes: 849,
                    directors: ['Blender Foundation'],
                    actors: ['Blender', 'Foundation', 'ket', 'Blender', 'Foundation', 'ket'],
                    genres: ['喜剧', '动作'],
                    region: 'US',
                    year: '2025',
                    isFavorite: false,
                    rating: 4.8,
                    publishDate: '2008-05-20',
                    episodeCount: 20,
                    episodes: [{
                        id: 1,
                        episode: "BigBuckBunny.mp4",
                        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                    }, {
                        id: 2,
                        episode: "ElephantsDream.mp4",
                        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                    }],

                }, {
                    id: 3,
                    title: 'Big Buck Bunny',
                    description: 'Big Buck Bunny tells the story of a giant rabbit with a heart bigger than himself.',
                    thumbnail: 'https://peach.blender.org/wp-content/uploads/title_anouncement.jpg',
                    duration: '9:56',
                    views: 10482,
                    likes: 849,
                    directors: ['Blender Foundation'],
                    actors: ['Blender', 'Foundation', 'ket', 'Blender', 'Foundation', 'ket'],
                    genres: ['喜剧', '动作'],
                    region: 'US',
                    year: '2025',
                    isFavorite: false,
                    rating: 4.8,
                    publishDate: '2008-05-20',
                    episodeCount: 20,
                    episodes: [{
                        id: 1,
                        episode: "第1集",
                        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                    }, {
                        id: 2,
                        episode: "第2集",
                        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                    }],

                }, {
                    id: 4,
                    title: 'Big Buck Bunny',
                    description: 'Big Buck Bunny tells the story of a giant rabbit with a heart bigger than himself.',
                    thumbnail: 'https://peach.blender.org/wp-content/uploads/title_anouncement.jpg',
                    duration: '9:56',
                    views: 10482,
                    likes: 849,
                    directors: ['Blender Foundation'],
                    actors: ['Blender', 'Foundation', 'ket', 'Blender', 'Foundation', 'ket'],
                    genres: ['喜剧', '动作'],
                    region: 'US',
                    year: '2025',
                    isFavorite: false,
                    rating: 4.8,
                    publishDate: '2008-05-20',
                    episodeCount: 20,
                    episodes: [{
                        id: 1,
                        episode: "第1集",
                        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                    }, {
                        id: 2,
                        episode: "第2集",
                        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                    }],

                }, {
                    id: 5,
                    title: 'Big Buck Bunny',
                    description: 'Big Buck Bunny tells the story of a giant rabbit with a heart bigger than himself.',
                    thumbnail: 'https://peach.blender.org/wp-content/uploads/title_anouncement.jpg',
                    duration: '9:56',
                    views: 10482,
                    likes: 849,
                    directors: ['Blender Foundation'],
                    actors: ['Blender', 'Foundation', 'ket', 'Blender', 'Foundation', 'ket'],
                    genres: ['喜剧', '动作'],
                    region: 'US',
                    year: '2025',
                    isFavorite: false,
                    rating: 4.8,
                    publishDate: '2008-05-20',
                    episodeCount: 20,
                    episodes: [{
                        id: 1,
                        episode: "第1集",
                        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                    }, {
                        id: 2,
                        episode: "第2集",
                        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                    }],
                }, {
                    id: 6,
                    title: 'Big Buck Bunny',
                    description: 'Big Buck Bunny tells the story of a giant rabbit with a heart bigger than himself.',
                    thumbnail: 'https://peach.blender.org/wp-content/uploads/title_anouncement.jpg',
                    duration: '9:56',
                    views: 10482,
                    likes: 849,
                    directors: ['Blender Foundation'],
                    actors: ['Blender', 'Foundation', 'ket', 'Blender', 'Foundation', 'ket'],
                    genres: ['喜剧', '动作'],
                    region: 'US',
                    year: '2025',
                    isFavorite: false,
                    rating: 4.8,
                    publishDate: '2008-05-20',
                    episodeCount: 20,
                    episodes: [{
                        id: 1,
                        episode: "第1集",
                        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                    }, {
                        id: 2,
                        episode: "第2集",
                        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                    }],
                }, {
                    id: 7,
                    title: 'Big Buck Bunny',
                    description: 'Big Buck Bunny tells the story of a giant rabbit with a heart bigger than himself.',
                    thumbnail: 'https://peach.blender.org/wp-content/uploads/title_anouncement.jpg',
                    duration: '9:56',
                    views: 10482,
                    likes: 849,
                    directors: ['Blender Foundation'],
                    actors: ['Blender', 'Foundation', 'ket', 'Blender', 'Foundation', 'ket'],
                    genres: ['喜剧', '动作'],
                    region: 'US',
                    year: '2025',
                    isFavorite: false,
                    rating: 4.8,
                    publishDate: '2008-05-20',
                    episodeCount: 20,
                    episodes: [{
                        id: 1,
                        episode: "第1集",
                        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                    }, {
                        id: 2,
                        episode: "第2集",
                        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                    }],
                }, {
                    id: 8,
                    title: 'Big Buck Bunny',
                    description: 'Big Buck Bunny tells the story of a giant rabbit with a heart bigger than himself.',
                    thumbnail: 'https://peach.blender.org/wp-content/uploads/title_anouncement.jpg',
                    duration: '9:56',
                    views: 10482,
                    likes: 849,
                    directors: ['Blender Foundation'],
                    actors: ['Blender', 'Foundation', 'ket', 'Blender', 'Foundation', 'ket'],
                    genres: ['喜剧', '动作'],
                    region: 'US',
                    year: '2025',
                    isFavorite: false,
                    rating: 4.8,
                    publishDate: '2008-05-20',
                    episodeCount: 20,
                    episodes: [{
                        id: 1,
                        episode: "第1集",
                        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                    }, {
                        id: 2,
                        episode: "第2集",
                        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                    }],
                }, {
                    id: 9,
                    title: 'Big Buck Bunny',
                    description: 'Big Buck Bunny tells the story of a giant rabbit with a heart bigger than himself.',
                    thumbnail: 'https://peach.blender.org/wp-content/uploads/title_anouncement.jpg',
                    duration: '9:56',
                    views: 10482,
                    likes: 849,
                    directors: ['Blender Foundation'],
                    actors: ['Blender', 'Foundation', 'ket', 'Blender', 'Foundation', 'ket'],
                    genres: ['喜剧', '动作'],
                    region: 'US',
                    year: '2025',
                    isFavorite: false,
                    rating: 4.8,
                    publishDate: '2008-05-20',
                    episodeCount: 20,
                    episodes: [{
                        id: 1,
                        episode: "第1集",
                        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                    }, {
                        id: 2,
                        episode: "第2集",
                        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                    }],
                }, {
                    id: 10,
                    title: 'Big Buck Bunny10',
                    description: 'Big Buck Bunny tells the story of a giant rabbit with a heart bigger than himself.',
                    thumbnail: 'https://peach.blender.org/wp-content/uploads/title_anouncement.jpg',
                    duration: '9:56',
                    views: 10482,
                    likes: 849,
                    directors: ['Blender Foundation'],
                    actors: ['Blender', 'Foundation', 'ket', 'Blender', 'Foundation', 'ket'],
                    genres: ['喜剧', '动作'],
                    region: 'US',
                    year: '2025',
                    isFavorite: false,
                    rating: 4.8,
                    publishDate: '2008-05-20',
                    episodeCount: 20,
                    episodes: [{
                        id: 1,
                        episode: "第1集",
                        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                    }, {
                        id: 2,
                        episode: "第2集",
                        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                    }],
                }
            ];
            setVideos([...videos, ...mockVideos]);
        } catch (error) {
            console.error('Error loading videos:', error);
            setMockError('Failed to load videos. Please try again.');
        } finally {
            setIsLoadingMockData(false);
        }
    };
    const [index, setIndex] = useState(0);

    useEffect(() => {
        try {
            loadVideos();
        } catch (err) {
            setMockError('Failed to initialize the screen. Please restart the app.');
        }
    }, []);

    useEffect(() => {
        console.log(`videos total ${videos.length}`);
        setVideosByRow(chunk(videos, 5));
    }, [videos]);

    useEffect(() => {
        const moreData: VideoItem[] = [
            {
                id: 11,
                title: 'Big Buck Bunny',
                description: 'Big Buck Bunny tells the story of a giant rabbit with a heart bigger than himself.',
                thumbnail: 'https://peach.blender.org/wp-content/uploads/title_anouncement.jpg',
                duration: '9:56',
                views: 10482,
                likes: 849,
                directors: ['Blender Foundation'],
                actors: ['Blender', 'Foundation', 'ket', 'Blender', 'Foundation', 'ket'],
                genres: ['喜剧', '动作'],
                region: 'US',
                year: '2025',
                isFavorite: false,
                rating: 4.8,
                publishDate: '2008-05-20',
                episodeCount: 20,
                episodes: [{
                    id: 1,
                    episode: "第1集",
                    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                }, {
                    id: 2,
                    episode: "第2集",
                    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                }],
            }
        ]
        if (down) {
            setVideos([...videos, ...moreData]);
            setDown(false)
        }
    }, [down]);

    const navigateToVideoDetails = (video) => {
        console.log('Navigating to video detail with video:', video.title);
        navigation.push('VideoDetail', {video});
    };

    const loadMore = () => {
        setDown(true)
    }


    return (
        <UpdateProvider>
            <Page loadMore={loadMore}>
                <SafeAreaView style={styles.container}>
                    <SpatialNavigationScrollView
                        offsetFromStart={HEADER_SIZE + 20}
                        descendingArrow={<TopArrow/>}
                        ascendingArrow={<BottomArrow/>}
                        descendingArrowContainerStyle={styles.topArrowContainer}
                        ascendingArrowContainerStyle={styles.bottomArrowContainer}
                    >
                        <Header/>
                        <TabBar
                            routes={TAB_ROUTES}
                            currentIndex={index}
                            onTabPress={(index: number) => {
                                navigation.navigate(TAB_ROUTES[index].screen);
                            }}
                        />
                        <VideoList
                            videosByRow={videosByRow}
                            onVideoPress={navigateToVideoDetails}
                        />

                    </SpatialNavigationScrollView>
                </SafeAreaView>
            </Page>
        </UpdateProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },
    topArrowContainer: {
        width: '100%',
        height: 100,
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        top: -15,
        left: 0,
    },
    bottomArrowContainer: {
        width: '100%',
        height: 100,
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        bottom: -15,
        left: 0,
    },
    leftArrowContainer: {
        width: 120,
        height: scaledPixels(260) + 2 * theme.spacings.$8,
        position: 'absolute',
        top: 0,
        justifyContent: 'center',
        alignItems: 'center',
        left: -theme.spacings.$8,
    },
    rightArrowContainer: {
        width: 120,
        height: scaledPixels(260) + 2 * theme.spacings.$8,
        position: 'absolute',
        top: 0,
        justifyContent: 'center',
        alignItems: 'center',
        right: -theme.spacings.$8,
    },

});
