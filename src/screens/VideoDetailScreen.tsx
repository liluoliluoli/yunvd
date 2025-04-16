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
import {
    DefaultFocus,
    SpatialNavigationFocusableView, SpatialNavigationNode,
    SpatialNavigationRoot,
    SpatialNavigationScrollView, SpatialNavigationView
} from "react-tv-space-navigation";
import {useIsFocused} from "@react-navigation/native";
import FocusablePressable from "../components/FocusablePressable";
import {scaledPixels} from "../hooks/useScale";
import {Page} from "../components/Page";
import {BottomArrow, TopArrow} from "../components/Arrows";
import styled from "@emotion/native";
import {Typography} from "../components/Typography";
import {Button} from "../components/Button";
import {Spacer} from "../components/Spacer";
import {theme} from "../theme/theme";
import {Episode} from "../components/Episode";

const HEADER_SIZE = scaledPixels(400);

const VideoDetailScreen = ({route, navigation}) => {
    const passedVideo = route.params?.video;
    const [isFavorite, setIsFavorite] = useState(false);
    const [focusedEpisode, setFocusedEpisode] = useState<number | null>(null);
    const isFocused = useIsFocused();

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

    return (
        <Page>
            <View style={styles.container}>
                <SpatialNavigationScrollView
                    offsetFromStart={HEADER_SIZE + 20}
                    descendingArrow={<TopArrow/>}
                    ascendingArrow={<BottomArrow/>}
                    descendingArrowContainerStyle={styles.topArrowContainer}
                    ascendingArrowContainerStyle={styles.bottomArrowContainer}
                >
                    <SpatialNavigationNode orientation={'horizontal'}>
                        <Container height={scaledPixels(500)}>
                            <ImageContainer>
                                <ProgramImage source={{uri: passedVideo?.thumbnail}}/>
                            </ImageContainer>
                            <InformationContainer>
                                <Typography variant="title"
                                            style={{textAlign: 'center'}}>{passedVideo?.title}</Typography>
                                <Spacer gap={'$6'}/>
                                <Tag variant="body"
                                     style={{textAlign: 'center'}}>{passedVideo?.region} {passedVideo?.year} {passedVideo?.genres?.join('/')}</Tag>
                                <Actor variant="body"
                                       style={{textAlign: 'center'}}>{passedVideo?.actors?.join(' / ')}</Actor>
                                <Descritption variant="body"
                                              style={{textAlign: 'center'}}>{passedVideo?.description}</Descritption>
                                <ButtonContainer>
                                    <Button label={isFavorite ? '已收藏' : '收藏'}
                                            onSelect={toggleFavorite}/>
                                    <Button label="续播" onSelect={() => console.log('续播!')}/>
                                    <Button label="下一集" onSelect={() => console.log('下一集!')}/>
                                </ButtonContainer>
                            </InformationContainer>

                        </Container>
                    </SpatialNavigationNode>

                    {passedVideo?.episodes?.map((episode, index) => (
                        <Episode key={episode.id} id={episode.id} label={episode.episode}
                                 onSelect={() => console.log('下一集!')}/>
                    ))}
                </SpatialNavigationScrollView>
            </View>
        </Page>
    );
};

const InformationContainer = styled.View({
    flex: 2,
});

const ButtonContainer = styled.View(({theme}) => ({
    flexDirection: 'row',
    gap: theme.spacings.$6,
    flex: 1.1,
    justifyContent: 'space-between',
    marginLeft: 10,
    marginRight: 10,
}));

const ImageContainer = styled.View({
    flex: 1
});

const Tag = styled(Typography)({
    flex: 1,
});

const Actor = styled(Typography)({
    flex: 1,
});

const Descritption = styled(Typography)({
    flex: 4,
});

const Container = styled.View<{ height: number }>(({height, theme}) => ({
    height: height,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacings.$6,
}));

const ProgramImage = styled(Image)({
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: 20,
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#000',
        padding: 10,
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
});

export default VideoDetailScreen;
