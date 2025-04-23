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
import {Button} from "../components/Button";

const HEADER_SIZE = scaledPixels(400);
export default function SettingScreen({route, navigation}) {
    const {user, isLoading, logout} = useAuthViewModel();

    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff"/>
                <ActivityIndicator size="large" color="#f44336"/>
                <Text style={styles.loadingText}>Loading setting...</Text>
            </SafeAreaView>
        );
    }

    const doSetting = () => {

    }

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
                    <View style={styles.contentContainer}>
                        <Image
                            source={require('../../assets/icon.png')}
                            style={styles.image}
                        />
                        <Button label='我已扫码设置' onSelect={() => doSetting()}/>
                    </View>
                </SpatialNavigationScrollView>
            </View>
        </Page>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
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
    contentContainer: {
        alignItems: 'center',
        paddingVertical: 100,
    },
    image: {
        width: 300,
        height: 300,
        borderRadius: 50,
        marginBottom: 15,
        backgroundColor: '#f0f0f0',
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

