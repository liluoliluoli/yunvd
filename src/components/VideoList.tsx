import React from 'react';
import {Image, StyleSheet, TouchableOpacity, View, Text} from 'react-native';
import {
    DefaultFocus,
    SpatialNavigationFocusableView,
    SpatialNavigationView
} from "react-tv-space-navigation";
import {scaledPixels} from "../hooks/useScale";
import VideoItem from "../models/VideoItem";

interface VideoListProps {
    videosByRow: VideoItem[][];
    onVideoPress: (video: VideoItem) => void;
}

export const VideoList = ({videosByRow, onVideoPress}: VideoListProps) => {
    const renderVideoItem = ({item}: { item: VideoItem }) => (
        <SpatialNavigationFocusableView onSelect={() => onVideoPress(item)} key={item.id}>
            {({isFocused, isRootActive}) => (
                <View style={{
                    width: scaledPixels(382),
                    borderWidth: 2,
                    borderRadius: 4,
                    backgroundColor: '#fff',
                    borderColor: isFocused && isRootActive ? 'white' : 'black',
                    overflow: 'hidden',
                }}>
                    <View style={styles.thumbnailContainer}>
                        <Image
                            source={{uri: item.thumbnail}}
                            style={styles.thumbnail}
                            resizeMode="stretch"
                        />
                        <TouchableOpacity style={styles.favoriteButton}>
                            <Text style={styles.favoriteIcon}>{item.isFavorite ? '★' : '☆'}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.videoDetails}>
                        <View style={styles.videoTextContent}>
                            <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>
                            <Text style={styles.videoSubtitle} numberOfLines={1}>
                                {item.actors?.join(',')}
                            </Text>
                            <Text style={styles.videoInfo} numberOfLines={1}>
                                {item.views} views • {item.publishDate || 'Unknown date'}
                            </Text>
                        </View>
                    </View>
                </View>
            )}
        </SpatialNavigationFocusableView>
    );

    const renderVideosByRow = (videos: VideoItem[], index: number) => (
        <SpatialNavigationView style={{height: scaledPixels(520), width: '100%'}} direction="horizontal" key={index}>
            {videos.map((item) => renderVideoItem({item}))}
        </SpatialNavigationView>
    );

    return (
        <View style={{flexDirection: 'row'}}>
            <SpatialNavigationView alignInGrid direction="vertical">
                <DefaultFocus>{videosByRow.map(renderVideosByRow)}</DefaultFocus>
            </SpatialNavigationView>
        </View>
    );
};

const styles = StyleSheet.create({
    thumbnailContainer: {
        height: scaledPixels(380),
        width: '100%',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    favoriteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    favoriteIcon: {
        color: 'gold',
        fontSize: 18,
        marginBottom: 4,
    },
    videoDetails: {
        flexDirection: 'row',
        padding: 6,
        alignItems: 'flex-start',
    },
    videoTextContent: {
        flex: 1,
        flexShrink: 1,
    },
    videoTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 2,
        lineHeight: 16,
    },
    videoSubtitle: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    videoInfo: {
        fontSize: 10,
        color: '#888',
    },
});
