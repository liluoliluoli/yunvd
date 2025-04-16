import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    SafeAreaView,
    StatusBar,
    Platform,
    BackHandler,
    ScrollView,
    Image,
    TVEventHandler,
} from 'react-native';
import {Ionicons} from "@expo/vector-icons";
import {DefaultFocus, SpatialNavigationFocusableView, SpatialNavigationRoot} from "react-tv-space-navigation";
import {useIsFocused} from "@react-navigation/native";
import FocusablePressable from "../components/FocusablePressable";
import {scaledPixels} from "../hooks/useScale";


const VideoDetailScreen = ({route, navigation}) => {
    const passedVideo = route.params?.video;
    const [isFavorite, setIsFavorite] = useState(false);
    const [focusedButton, setFocusedButton] = useState<'favorite' | 'continue' | 'next'>('continue');
    const [focusedEpisode, setFocusedEpisode] = useState<number | null>(null);
    const isFocused = useIsFocused();

    const handleBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const onSelected = useCallback(() => {
        console.log("on selected");
    }, []);

    const toggleFavorite = useCallback(() => {
        setIsFavorite(!isFavorite);
    }, [isFavorite]);

    const handleContinue = useCallback(() => {
        // 处理续播逻辑
    }, []);

    const handleNextEpisode = useCallback(() => {
        // 处理下一集逻辑
    }, []);

    const handleEpisodePress = useCallback((index: number) => {
        // 处理剧集点击
        setFocusedEpisode(index);
    }, []);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            handleBack();
            return true;
        });
        // 电视遥控器事件处理
        // TVEventHandler.addListener(evt => {
        // if (evt.eventType === 'right') {
        //     if (focusedButton === 'favorite') setFocusedButton('continue');
        //     else if (focusedButton === 'continue') setFocusedButton('next');
        // } else if (evt.eventType === 'left') {
        //     if (focusedButton === 'next') setFocusedButton('continue');
        //     else if (focusedButton === 'continue') setFocusedButton('favorite');
        // } else if (evt.eventType === 'select') {
        //     if (focusedButton === 'favorite') toggleFavorite();
        //     else if (focusedButton === 'continue') handleContinue();
        //     else if (focusedButton === 'next') handleNextEpisode();
        // } else if (evt.eventType === 'up' && focusedEpisode !== null) {
        //     setFocusedEpisode(null);
        //     setFocusedButton('continue');
        // } else if (evt.eventType === 'down' && focusedEpisode === null) {
        //     setFocusedEpisode(0);
        // }
        // });

        return () => {
            backHandler.remove();
        };
    }, [focusedButton, focusedEpisode]);

    return (
        <SpatialNavigationRoot isActive={true}>
            <View style={styles.container}>
                <View style={styles.topContainer}>

                    <View style={styles.thumbnail}>
                        <DefaultFocus>
                            <SpatialNavigationFocusableView onSelect={onSelected}>
                                <Image
                                    source={{uri: passedVideo?.thumbnail}}
                                    style={styles.thumbnailImage}
                                    resizeMode="cover"
                                />
                            </SpatialNavigationFocusableView>
                        </DefaultFocus>
                    </View>


                    <View style={styles.info}>
                        <Text style={styles.title}>{passedVideo?.title}</Text>
                        <Text style={styles.tag}>
                            {passedVideo?.region} {passedVideo?.year} {passedVideo?.genres?.join('/')}
                        </Text>
                        <Text style={styles.actor}>{passedVideo?.actors?.join(' / ')}</Text>

                        <ScrollView style={styles.description}>
                            <Text style={styles.descriptionText}>{passedVideo?.description}</Text>
                        </ScrollView>

                        <View style={styles.opContainer}>
                            <SpatialNavigationFocusableView onSelect={onSelected}>
                                <Text style={styles.buttonText}>{isFavorite ? '已收藏' : '收藏'}</Text>
                            </SpatialNavigationFocusableView>
                            <SpatialNavigationFocusableView onSelect={onSelected}>
                                <Text style={styles.buttonText}>续播</Text>
                            </SpatialNavigationFocusableView>
                            <SpatialNavigationFocusableView onSelect={onSelected}>
                                <Text style={styles.buttonText}>下一集</Text>
                            </SpatialNavigationFocusableView>
                        </View>
                    </View>
                </View>

                <View style={styles.bottomContainer}>
                    <Text style={styles.episodeTitle}>剧集列表</Text>
                    <ScrollView>
                        {passedVideo?.episodes?.map((episode, index) => (
                            <View key={index}>
                                <TouchableOpacity
                                    style={[
                                        styles.episodeItem,
                                        focusedEpisode === index && styles.focused
                                    ]}
                                    onPress={() => handleEpisodePress(index)}
                                >
                                    <View style={styles.episodeContent}>
                                        <Ionicons name="play" style={styles.playIcon} size={20} color="#fff"/>
                                        <Text style={styles.episodeText}>第{episode.episode}集</Text>
                                    </View>
                                </TouchableOpacity>
                                {index < passedVideo.episodes.length - 1 && (
                                    <View style={styles.divider}/>
                                )}
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </SpatialNavigationRoot>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#000',
        padding: 10,
    },
    topContainer: {
        flex: 1,
        flexDirection: 'row',
        marginBottom: 10,
    },
    thumbnail: {
        flex: 1,
        marginRight: 10,
    },
    thumbnailImage: {
        width: '100%',
        height: '100%',
        borderRadius: 5,
    },
    info: {
        flex: 2,
        flexDirection: 'column',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
        textAlign: 'center',
    },
    tag: {
        fontSize: 14,
        color: '#aaa',
        marginBottom: 8,
        textAlign: 'center',
    },
    actor: {
        fontSize: 14,
        color: '#fff',
        marginBottom: 8,
        textAlign: 'center',
    },
    description: {
        flex: 1,
        marginBottom: 10,
        textAlign: 'center',
    },
    descriptionText: {
        fontSize: 14,
        color: '#ddd',
        lineHeight: 20,
        textAlign: 'center',
    },
    opContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 40,
    },
    favorite: {
        flex: 1,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginRight: 5,
    },
    favoriteActive: {
        backgroundColor: '#f44336',
    },
    continue: {
        flex: 1,
        backgroundColor: '#2196F3',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginLeft: 5,
    },
    nextEpisode: {
        flex: 1,
        backgroundColor: '#4CAF50', // 绿色按钮
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginLeft: 5,
    },
    bottomContainer: {
        flex: 1,
    },
    episodeTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    episodeItem: {
        width: '100%',
        height: 40,
        justifyContent: 'center',
        borderRadius: 5,
        marginBottom: 10,
    },
    episodeText: {
        color: '#fff',
        marginLeft: 3,
    },
    episodeContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    playIcon: {
        marginLeft: 5,
    },
    divider: {
        height: 1,
        backgroundColor: '#fff',
    },
    focused: {
        borderWidth: 2,
        borderColor: '#fff',
    },
    buttonText: {
        color: '#fff',
    },
});

export default VideoDetailScreen;
