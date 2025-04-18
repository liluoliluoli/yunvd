import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {View, ActivityIndicator, useWindowDimensions} from 'react-native';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import VideoPlayerScreen from './src/screens/VideoPlayerScreen';
import VideoDetailScreen from "./src/screens/VideoDetailScreen";
import "./src/configureRemoteControl"
import {useFonts} from './src/hooks/useFonts';
import {ThemeProvider} from '@emotion/react';
import {SpatialNavigationDeviceTypeProvider} from "react-tv-space-navigation";
import styled from "@emotion/native";
import {theme} from "./src/theme/theme";


const Stack = createNativeStackNavigator();

export default function App() {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const areFontsLoaded = useFonts();
    const {height, width} = useWindowDimensions();
    if (!areFontsLoaded) {
        return null;
    }
    useEffect(() => {
        // Check if user is logged in
        const checkAuthStatus = async () => {
            try {
                const userToken = await AsyncStorage.getItem('userToken');
                setIsAuthenticated(!!userToken);
            } catch (error) {
                console.error('Error checking auth status:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    // Show loading screen
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
                        {/* Auth Screens */}
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
                            name="ForgotPassword"
                            component={ForgotPasswordScreen}
                            options={{animationEnabled: true}}
                        />

                        {/* App Screens */}
                        <Stack.Screen
                            name="Home"
                            component={HomeScreen}
                            options={{animationEnabled: true}}
                        />
                        <Stack.Screen
                            name="Profile"
                            component={ProfileScreen}
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
