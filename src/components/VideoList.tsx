import React from 'react';
import {Image, StyleSheet, TouchableOpacity, View, Text, Dimensions} from 'react-native';
import {
    DefaultFocus,
    SpatialNavigationFocusableView,
    SpatialNavigationView
} from "react-tv-space-navigation";
import {scaledPixels} from "../hooks/useScale";
import Video from "../models/Video";
import {Ionicons} from "@expo/vector-icons";
import {formatFriendlyTime} from "../utils/ApiConstants";

interface VideoListProps {
    isHistory: boolean;
    videosByRow: Video[][];
    onVideoPress: (video: Video) => void;
}

const {width} = Dimensions.get('window');
export const VideoList = ({isHistory, videosByRow, onVideoPress}: VideoListProps) => {
    const renderVideoItem = ({item, index, isHistory}: { item: Video, index: number, isHistory: boolean }) => (
        <SpatialNavigationFocusableView onSelect={() => onVideoPress(item)} key={index}
                                        style={{width: (width - 20) / 5}}>
            {({isFocused, isRootActive}) => (
                <View style={{
                    borderWidth: isFocused && isRootActive ? 1 : 0,
                    borderRadius: 4,
                    borderColor: isFocused && isRootActive ? 'rgba(255, 255, 255, 1)' : 'black',
                    overflow: 'hidden',
                    flex: 1,
                    alignItems: 'center',
                    marginBottom: 10
                }}>
                    <View style={styles.thumbnailContainer}>
                        <Image
                            source={{uri: item.thumbnail}}
                            style={styles.thumbnail}
                            resizeMode="stretch"
                        />
                        <TouchableOpacity style={styles.rateButton}>
                            <Text style={styles.rateIcon}>{item.voteRate.toFixed(1)}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.ratioButton}>
                            <Text style={styles.ratioIcon}>{item.ratio}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.videoDetails}>
                        <Text style={styles.videoTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.videoInfo} numberOfLines={1}>
                            {isHistory && item.lastPlayedTime ?
                                `最近播放: ${formatFriendlyTime(item.lastPlayedTime)}` :
                                item.publishMonth.substring(0, 4)}
                        </Text>
                    </View>
                </View>
            )}
        </SpatialNavigationFocusableView>
    );

    const renderVideosByRow = (videos: Video[], index: number, isHistory: boolean) => (
        <SpatialNavigationView
            style={{
                height: scaledPixels(520),
                width: '100%',
                justifyContent: 'flex-start',
                gap: 4
            }}
            direction="horizontal" key={index}>
            {videos.map((item, index) => renderVideoItem({item, index, isHistory}))}
        </SpatialNavigationView>
    );

    return (
        <View style={{flexDirection: 'row', paddingTop: 8}}>
            <SpatialNavigationView alignInGrid direction="vertical">
                {videosByRow.map((row, index) => renderVideosByRow(row, index, isHistory))}
            </SpatialNavigationView>
        </View>
    );
};

const styles = StyleSheet.create({
    thumbnailContainer: {
        height: scaledPixels(400),
        width: '94%',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    thumbnail: {
        width: '100%',
        height: '94%',
        borderRadius: 2,
    },
    rateButton: {
        position: 'absolute',
        top: 10,
        right: 5,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        width: 30,
        height: 30,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rateIcon: {
        color: 'gold',
        fontSize: 14,
        marginBottom: 2,
    },
    ratioButton: {
        position: 'absolute',
        top: 12,
        left: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ratioIcon: {
        color: 'white',
        fontSize: 14,
        marginBottom: 2,
    },
    videoDetails: {
        alignItems: 'center',
        width: '94%',
        paddingBottom: 5
    },
    videoTextContent: {
        flex: 1,
        flexShrink: 1,
    },
    videoTitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 1)',
        lineHeight: 16,
    },
    videoInfo: {
        flexDirection: 'row',
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.7)',
        alignItems: 'center',
    },
});
