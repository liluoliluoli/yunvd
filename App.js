import React, {useEffect, useRef, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ActivityIndicator, View} from 'react-native';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import VideoPlayerScreen from './src/screens/VideoPlayerScreen';
import VideoDetailScreen from "./src/screens/VideoDetailScreen";
import "./src/configureRemoteControl"
import {useFonts} from './src/hooks/useFonts';
import {ThemeProvider} from '@emotion/react';
import {SpatialNavigationDeviceTypeProvider} from "react-tv-space-navigation";
import {theme} from "./src/theme/theme";
import MovieScreen from "./src/screens/MovieScreen";
import SearchScreen from "./src/screens/SearchScreen";
import FavoriteScreen from "./src/screens/FavoriteScreen";
import SettingScreen from "./src/screens/SettingScreen";
import {PAGE_SIZE, STORAGE_KEYS} from "./src/utils/ApiConstants";
import TvSeriesScreen from "./src/screens/TvSeriesScreen";
import TvShowScreen from "./src/screens/TvShowScreen";
import RecordScreen from "./src/screens/RecordScreen";
import apiService from "./src/services/ApiService";
import ApiService from "./src/services/ApiService";
import BackgroundTimer from 'react-native-background-timer';


const Stack = createNativeStackNavigator();

export default function App() {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const areFontsLoaded = useFonts();
    const backgroundTimerIdRef = useRef(null);
    if (!areFontsLoaded) {
        return null;
    }

    const reportWatchHistory = async () => {
        try {
            if (isAuthenticated) {
                const historyJson = await AsyncStorage.getItem(STORAGE_KEYS.WATCH_HISTORY);
                if (historyJson) {
                    console.log(historyJson);
                    const historyData = JSON.parse(historyJson);
                    const response = await ApiService.updatePlayedStatus(historyData);
                    if (!response) {
                        console.error('Failed to report watch history:', await response.text());
                    } else {
                        await AsyncStorage.removeItem(STORAGE_KEYS.WATCH_HISTORY);
                    }
                }
            }
        } catch (error) {
            console.error('Error reporting watch history:', error);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            backgroundTimerIdRef.current = BackgroundTimer.setInterval(reportWatchHistory, 60 * 1000);
        } else {
            if (backgroundTimerIdRef.current) {
                BackgroundTimer.clearInterval(backgroundTimerIdRef.current);
            }
        }
        return () => {
            if (backgroundTimerIdRef.current) {
                BackgroundTimer.clearInterval(backgroundTimerIdRef.current);
            }
        };
    }, [isAuthenticated]);

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const userToken = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
                setIsAuthenticated(!!userToken);
            } catch (error) {
                console.error('Error checking auth status:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    if (isLoading) {
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <ActivityIndicator size="large" color="#0000ff"/>
            </View>
        );
    }

    return (

        <NavigationContainer>
            <ThemeProvider theme={theme}>
                <SpatialNavigationDeviceTypeProvider>
                    <Stack.Navigator
                        screenOptions={{headerShown: false}}
                        initialRouteName={isAuthenticated ? 'Home' : 'Login'}
                    >
                        <Stack.Screen
                            name="Login"
                            component={LoginScreen}
                            options={{animationEnabled: true}}
                        />
                        <Stack.Screen
                            name="SignUp"
                            component={SignUpScreen}
                            options={{animationEnabled: true}}
                        />
                        <Stack.Screen
                            name="Home"
                            component={HomeScreen}
                            options={{animationEnabled: true}}
                        />
                        <Stack.Screen
                            name="Movie"
                            component={MovieScreen}
                            options={{animationEnabled: true}}
                        />
                        <Stack.Screen
                            name="TvSeries"
                            component={TvSeriesScreen}
                            options={{animationEnabled: true}}
                        />
                        <Stack.Screen
                            name="TvShow"
                            component={TvShowScreen}
                            options={{animationEnabled: true}}
                        />
                        <Stack.Screen
                            name="Record"
                            component={RecordScreen}
                            options={{animationEnabled: true}}
                        />
                        <Stack.Screen
                            name="Search"
                            component={SearchScreen}
                            options={{animationEnabled: true}}
                        />
                        <Stack.Screen
                            name="Favorite"
                            component={FavoriteScreen}
                            options={{animationEnabled: true}}
                        />
                        <Stack.Screen
                            name="Profile"
                            component={ProfileScreen}
                            options={{animationEnabled: true}}
                        />
                        <Stack.Screen
                            name="Setting"
                            component={SettingScreen}
                            options={{animationEnabled: true}}
                        />
                        <Stack.Screen
                            name="VideoDetail"
                            component={VideoDetailScreen}
                        />
                        <Stack.Screen
                            name="VideoPlayer"
                            component={VideoPlayerScreen}
                            options={{
                                orientation: 'landscape',
                            }}
                        />
                    </Stack.Navigator>
                </SpatialNavigationDeviceTypeProvider>
            </ThemeProvider>
        </NavigationContainer>
    );
}
