import React, {useCallback, useContext, useEffect, useState} from 'react';
import {View, Image, StyleSheet, Alert, Modal, TouchableOpacity} from 'react-native';
import {Button} from "./Button";
import {TextInput} from "./TextInput";
import {Spacer} from "./Spacer";
import {scaledPixels} from "../hooks/useScale";
import {SpatialNavigationNode} from "react-tv-space-navigation";
import {useNavigation} from "@react-navigation/native";
import * as UpdateAPK from "rn-update-apk";
import {version} from '../../package.json'
import {UpdateContext} from "./UpdateContext";
import {Typography} from "./Typography";
import useAuthViewModel from "../viewModels/AuthViewModel";


export const Header = ({}) => {
    const navigation = useNavigation<any>();
    const [hasUpdate, setHasUpdate] = useState<boolean>(false);
    const [currentVersion, setCurrentVersion] = useState<string>(version);
    const {downloadProgress, setDownloadProgress} = useContext(UpdateContext);
    const {user, isLoading, logout} = useAuthViewModel();
    const [showDonateModal, setShowDonateModal] = useState(false);


    useEffect(() => {
        const updater = new UpdateAPK.UpdateAPK({
            iosAppId: "1104809018",
            apkVersionUrl: "https://raw.githubusercontent.com/mikehardy/react-native-update-apk/master/example/test-version.json",
            apkVersionOptions: {
                method: 'GET',
                headers: {}
            },
            apkOptions: {
                headers: {}
            },
            needUpdateApp: performUpdate => {
                setHasUpdate(true);
            },
            onError: (err) => {
                console.log("onError callback called", err);
            }
        });
        const checkUpdate = () => {
            console.log("checking for update");
            updater.checkUpdate();

        };
        checkUpdate();
    }, []);

    const onUpdate = () => {
        if (!hasUpdate) {
            console.log("当前已是最新版本");
            return;
        }
        const updater = new UpdateAPK.UpdateAPK({
            iosAppId: "1104809018",
            apkVersionUrl: "https://raw.githubusercontent.com/mikehardy/react-native-update-apk/master/example/test-version.json",
            apkVersionOptions: {
                method: 'GET',
                headers: {}
            },
            apkOptions: {
                headers: {}
            },
            fileProviderAuthority: "com.example",
            needUpdateApp: performUpdate => {
                Alert.alert(
                    "Update Available",
                    "New version released, do you want to update? ",
                    [
                        {
                            text: "Cancel", onPress: () => {
                            }
                        },
                        {text: "Update", onPress: () => performUpdate(true)}
                    ]
                );
            },
            downloadApkProgress: progress => {
                console.log(`downloadApkProgress callback called - ${progress}%...`);
                setDownloadProgress(Math.round(progress));
            },
            onError: (err) => {
                console.log("onError callback called", err);
            }
        });
        const checkUpdate = () => {
            console.log("checking for update");
            updater.checkUpdate();

        };
        checkUpdate();
    };

    const onProfile = () => {
        navigation.navigate('Profile');
    }
    const onDonate = () => {
        setShowDonateModal(true);
    }
    const onFavorite = () => {
        navigation.navigate('Favorite');
    }
    const onSetting = () => {
        navigation.navigate('Setting');
    }

    return (
        <SpatialNavigationNode orientation={'horizontal'}>
            <View>
                <View style={styles.header}>
                    <Image
                        source={require('../../assets/icon.png')}
                        style={styles.logo}
                        resizeMode="cover"
                    />
                    <View style={styles.searchContainer}>
                        <TextInput placeholder='搜索'
                                   onEnterPress={(text) => navigation.navigate('Search', {keyword: text})}/>
                    </View>
                    <Button
                        label={downloadProgress === 0 ? `更新` : `${downloadProgress}%`}
                        onSelect={onUpdate}
                        hidden={!hasUpdate}
                    />
                    <Typography variant="title"
                                style={{textAlign: 'center'}} hidden={hasUpdate}>v{currentVersion}</Typography>
                    <Spacer direction={"horizontal"} gap={'$6'}/>
                    <Button label={user?.name + '(' + 180 + ')'} onSelect={onProfile}/>
                    <Spacer direction={"horizontal"} gap={'$6'}/>
                    <Button label="赞赏" onSelect={onDonate}/>
                    <Modal
                        visible={showDonateModal}
                        transparent={true}
                        animationType="fade"
                        onRequestClose={() => setShowDonateModal(false)}
                    >
                        <TouchableOpacity
                            style={styles.modalOverlay}
                            activeOpacity={1}
                            onPress={() => setShowDonateModal(false)}
                        >
                            <Image
                                source={require('../../assets/icon.png')} // 替换为你的赞赏图片路径
                                style={styles.donateImage}
                                resizeMode="contain"
                            />
                        </TouchableOpacity>
                    </Modal>

                    <Spacer direction={"horizontal"} gap={'$6'}/>
                    <Button label="收藏" onSelect={onFavorite}/>
                    <Spacer direction={"horizontal"} gap={'$6'}/>
                    <Button label="设置" onSelect={onSetting}/>
                </View>
                <View style={styles.divider}/>
            </View>
        </SpatialNavigationNode>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 3,
        backgroundColor: 'black',
        width: '100%',
    },
    logo: {
        width: 30,
        height: 30,
    },
    searchContainer: {
        width: scaledPixels(500),
        flexDirection: 'row',
        marginHorizontal: 10,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        borderWidth: 0,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    donateImage: {
        width: '80%',
        height: '60%',
    },
    divider: {
        height: 0.5,
        backgroundColor: 'white',
        width: '100%',
    },
});
