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
  BackHandler
} from 'react-native';

let Video = null;
if (Platform.OS !== 'web') {
  try {
    const ExpoAV = require('expo-av');
    Video = ExpoAV.Video;
  } catch (error) {
    console.error('Failed to load expo-av:', error);
  }
}

const VideoPlayerScreen = ({ route, navigation }) => {
  const passedVideo = route.params?.video;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTitle, setShowTitle] = useState(false);

  const videoRef = useRef(null);
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    StatusBar.setHidden(true);
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });

    return () => {
      StatusBar.setHidden(false);
      subscription.remove();
      backHandler.remove();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (videoRef.current && Platform.OS !== 'web' && Video) {
        videoRef.current.unloadAsync().catch(err => console.error('Error unloading video:', err));
      }
    };
  }, []);

  const handleBack = useCallback(() => {
    StatusBar.setHidden(false);
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
      <StatusBar hidden={true} />
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
        ) : Video ? (
          <Video
            ref={videoRef}
            source={{ uri: passedVideo.videoUrl }}
            style={styles.video}
            resizeMode="contain"
            shouldPlay
            useNativeControls={true}
            onLoadStart={() => setIsLoading(true)}
            onLoad={() => setIsLoading(false)}
            onPlaybackStatusUpdate={(status) => {
              setIsPlaying(status.isPlaying);
              setIsLoading(status.isBuffering);
            }}
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
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 5,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
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
});

export default VideoPlayerScreen;
