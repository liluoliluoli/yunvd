import React, {useState, useEffect} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    SafeAreaView,
    StatusBar,
    Platform
} from 'react-native';
import useAuthViewModel from '../viewModels/AuthViewModel';
import {Page} from "../components/Page";
import {BottomArrow, TopArrow} from "../components/Arrows";
import {
    SpatialNavigationFocusableView,
    SpatialNavigationNode,
    SpatialNavigationScrollView
} from "react-tv-space-navigation";
import {scaledPixels} from "../hooks/useScale";
import {Episode} from "../components/Episode";

const HEADER_SIZE = scaledPixels(400);
const ProfileScreen = ({navigation}) => {
    const {user, isLoading, logout} = useAuthViewModel();
    const [stats, setStats] = useState({
        videosWatched: 0,
        favoritesCount: 0,
        commentsCount: 0
    });

    useEffect(() => {
        // Load user stats (in a real app, you would fetch this from an API)
        setStats({
            videosWatched: 42,
            favoritesCount: 15,
            commentsCount: 8
        });
    }, []);

    const handleLogout = async () => {
        const success = await logout();
        if (success) {
            navigation.navigate('Login');
        } else {
            Alert.alert('Error', 'Failed to logout. Please try again.');
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff"/>
                <ActivityIndicator size="large" color="#f44336"/>
                <Text style={styles.loadingText}>Loading profile...</Text>
            </SafeAreaView>
        );
    }

    return (
        <Page>
            <View style={styles.safeAreaContainer}>
                <SpatialNavigationScrollView
                    offsetFromStart={HEADER_SIZE + 20}
                    descendingArrow={<TopArrow/>}
                    ascendingArrow={<BottomArrow/>}
                    descendingArrowContainerStyle={styles.topArrowContainer}
                    ascendingArrowContainerStyle={styles.bottomArrowContainer}
                >
                    <View style={styles.profileSection}>
                        <Image
                            source={require('../../assets/icon.png')}
                            style={styles.profileImage}
                        />
                        <Text style={styles.userName}>{user?.name || 'User'}</Text>
                        <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
                    </View>

                    <View style={styles.statsSection}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{stats.videosWatched}</Text>
                            <Text style={styles.statLabel}>今天已观看</Text>
                        </View>
                        <View style={styles.statDivider}/>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{stats.favoritesCount}</Text>
                            <Text style={styles.statLabel}>收藏</Text>
                        </View>
                    </View>
                    <View style={styles.optionsSection}>
                        <Episode key={1} id={1} label='设置'
                                 onSelect={() => console.log("")}/>
                        <Episode key={2} id={2} label='登出'
                                 onSelect={handleLogout}/>
                    </View>
                </SpatialNavigationScrollView>
            </View>
        </Page>
    );
};

const styles = StyleSheet.create({
    safeAreaContainer: {
        flex: 1,
        backgroundColor: '#111111',
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        paddingBottom: 30,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 10,
        color: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        marginRight: 15,
    },
    backButtonText: {
        fontSize: 16,
        color: '#f44336',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    profileSection: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 15,
        backgroundColor: '#f0f0f0',
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#fff',
    },
    userEmail: {
        fontSize: 16,
        color: '#fff',
    },
    statsSection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 20,
        backgroundColor: '#f8f8f8',
        marginHorizontal: 15,
        borderRadius: 10,
        marginBottom: 25,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f44336',
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
    },
    statDivider: {
        width: 1,
        backgroundColor: '#e0e0e0',
    },
    optionsSection: {
        marginHorizontal: 15,
        marginBottom: 30,
    },
    optionItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    optionText: {
        fontSize: 16,
        color: '#fff',
    },
    logoutOption: {
        marginTop: 15,
        borderBottomWidth: 0,
    },
    logoutText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '500',
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

export default ProfileScreen;
