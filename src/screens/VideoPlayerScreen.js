import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  BackHandler, ScrollView
} from 'react-native';
import { VideoView,useVideoPlayer } from "expo-video";
import * as ScreenOrientation from 'expo-screen-orientation';

// let VideoView = null;
// if (Platform.OS !== 'web') {
//   try {
//     const ExpoAV = require('expo-video');
//     VideoView = ExpoAV.VideoView;
//   } catch (error) {
//     console.error('Failed to load expo-av:', error);
//   }
// }

const VideoPlayerScreen = ({ route, navigation }) => {
  const passedVideo = route.params?.video;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const videoRef = useRef(null);
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const player = useVideoPlayer(passedVideo.videoUrl, player => {
    player.currentTime = 100;
    player.play();
  });
  const toggleFullscreen = async () => {
    if (!isFullscreen) {
      // 进入全屏并锁定横屏
      await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE
      );
      setIsFullscreen(true);
    } else {
      // 退出全屏恢复竖屏
      await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT
      );
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    // StatusBar.setHidden(true);
    handleTap();
    const windowSubscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });

    const playerSubscription = player.addListener('statusChange', ({ status, error }) => {
      console.log('Player status changed: ', status);
      if (status === "loading") {
        setIsLoading(true);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      // StatusBar.setHidden(false);
      windowSubscription.remove();
      backHandler.remove();
      playerSubscription.remove();
    };
  }, []);

  // useEffect(() => {
  //   return () => {
  //     if (videoRef.current && Platform.OS !== 'web' && Video) {
  //       videoRef.current.unloadAsync().catch(err => console.error('Error unloading video:', err));
  //     }
  //   };
  // }, []);

  const handleBack = useCallback(() => {
    // StatusBar.setHidden(false);
    navigation.goBack();
  }, [navigation]);

  const handleTap = () => {
    setShowTitle(true);
    setTimeout(() => setShowTitle(false), 5000);
  };

  if (!passedVideo || !passedVideo.videoUrl) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No video found to play</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleBack}>
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/*<StatusBar hidden={true} />*/}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.videoContainer} activeOpacity={1} onPress={handleTap}>
        {Platform.OS === 'web' ? (
          <video
            style={styles.video}
            src={passedVideo.videoUrl}
            poster={passedVideo.thumbnail}
            controls
            autoPlay
          />
        ) : VideoView ? (
          <VideoView
            ref={videoRef}
            style={styles.video}
            allowsFullscreen
            allowsPictureInPicture
            nativeControls
            player = {player}
            onFullscreenEnter={toggleFullscreen}
            onFullscreenExit={toggleFullscreen}
            onError={() => setError('Video playback error')}
          />
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Video playback not available.</Text>
          </View>
        )}
        {showTitle && (
          <View style={styles.videoTitleContainer}>
            <Text style={styles.videoTitle}>{passedVideo.title}</Text>
          </View>
        )}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#f44336" />
            <Text style={styles.loadingText}>Loading video...</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* 添加影片信息 */}
      <View style={styles.videoInfoContainer}>
        <Text style={styles.videoInfoText}>影片描述: {passedVideo.description}</Text>
        <Text style={styles.videoInfoText}>演员: {passedVideo.description}</Text>

      </View>
      <View style={styles.episodeHeadContainer}>
        <Text style={styles.episodeListTitle}>集数列表</Text>
      </View>
      {/* 添加集数列表 */}
      <ScrollView style={styles.episodeListContainer}>
        {passedVideo.episodes && passedVideo.episodes.map((episode, index) => (
            <TouchableOpacity
                key={index}
                style={styles.episodeItem}
                // onPress={() => handleEpisodePress(episode)}
            >
              <Text style={styles.episodeItemText}>第 {episode.episode } 集</Text>
            </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
  },
  backButton: {
    padding: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 5,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  video: {
    width: '100%',
    flex: 1,
  },
  videoTitleContainer: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 5,
  },
  videoTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#f44336',
    fontSize: 16,
  },
  retryButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f44336',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
  },

  videoInfoContainer: {
    backgroundColor: '#111',
    width: '100%',
    flex: 0.4,
  },
  videoInfoText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 5,
  },

  episodeHeadContainer: {
    backgroundColor: '#111',
    width: '100%',
    height: 30,
  },

  episodeListContainer: {
    padding: 10,
    backgroundColor: '#111',
    width: '100%',
    flex: 1,
  },
  episodeListTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  episodeItem: {
    padding: 10,
    backgroundColor: '#222',
    marginBottom: 5,
    borderRadius: 5,
  },
  episodeItemText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default VideoPlayerScreen;
