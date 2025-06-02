import React, {useEffect, useState} from 'react';
import {Image, Modal, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Button} from "./Button";
import {TextInput} from "./TextInput";
import {Spacer} from "./Spacer";
import {scaledPixels} from "../hooks/useScale";
import {SpatialNavigationNode} from "react-tv-space-navigation";
import {useNavigation} from "@react-navigation/native";
import * as UpdateAPK from "rn-update-apk";
import {version} from '../../package.json'
import {Typography} from "./Typography";
import {useAuthViewModel} from "../viewModels/AuthViewModel";
import {ENDPOINTS, formatToYMD} from "../utils/ApiConstants";

export const Header = ({}) => {
    const navigation = useNavigation<any>();
    const [hasUpdate, setHasUpdate] = useState<boolean>(false);
    const [currentVersion, setCurrentVersion] = useState<string>(version);
    const [downloadProgress, setDownloadProgress] = useState<number>(0);
    const {userName, watchCount, restWatchCount, packageExpiredTime} = useAuthViewModel();
    const [showDonateModal, setShowDonateModal] = useState(false);
    const [showDownloadModal, setShowDownloadModal] = useState(false);

    useEffect(() => {
        const updater = new UpdateAPK.UpdateAPK({
            iosAppId: "1104809018",
            apkVersionUrl: ENDPOINTS.GET_LAST_APP_VERSION,
            apkVersionOptions: {
                method: 'GET',
                headers: {}
            },
            apkOptions: {
                headers: {}
            },
            fileProviderAuthority: "com.zyun.yunvd",
            needUpdateApp: performUpdate => {
                setHasUpdate(true);
            },
            onError: (err) => {
                console.log("onError callback called", err);
            }
        });
        const checkUpdate = () => {
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
            apkVersionUrl: ENDPOINTS.GET_LAST_APP_VERSION,
            apkVersionOptions: {
                method: 'GET',
                headers: {}
            },
            apkOptions: {
                headers: {}
            },
            fileProviderAuthority: "com.zyun.yunvd",
            needUpdateApp: performUpdate => {
                setShowDownloadModal(true);
                performUpdate(true);
            },
            downloadApkProgress: progress => {
                console.log(`downloadApkProgress callback called - ${progress}%...`);
                setDownloadProgress(Math.round(progress));
            },
            onError: (err) => {
                console.log("onError callback called", err);
                setShowDownloadModal(false);
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
                <Modal
                    visible={showDownloadModal}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowDownloadModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.downloadProgressContainer}>
                            <Typography variant="body">下载进度: {downloadProgress}%</Typography>
                        </View>
                    </View>
                </Modal>
                <View style={styles.header}>
                    <Spacer direction={"horizontal"} gap={'$2'}/>
                    <Typography variant="title">YunVD</Typography>
                    <Spacer direction={"horizontal"} gap={'$1'}/>
                    <Typography variant="body">v{currentVersion} </Typography>
                    <Spacer direction={"horizontal"} gap={'$6'}/>
                    <Button
                        label={downloadProgress === 0 ? `更新` : `${downloadProgress}%`}
                        onSelect={onUpdate}
                        hidden={!hasUpdate}
                    />
                    <Spacer direction={"horizontal"} gap={'$6'}/>
                    <Button
                        label={userName + '(' + restWatchCount + ')'}
                        onSelect={onProfile}/>
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
                    <Spacer direction={"horizontal"} gap={'$6'}/>
                    <View style={styles.searchContainer}>
                        <TextInput placeholder='搜索'
                                   onEnterPress={(text) => navigation.navigate('Search', {keyword: text})}/>
                    </View>


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
        backgroundColor: '#1a1a1a',
        width: '100%',
    },
    logo: {
        width: 30,
        height: 30,
    },
    searchContainer: {
        width: scaledPixels(400),
        flexDirection: 'row',
        marginHorizontal: 10,
        height: 40,
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
        height: 0.3,
        backgroundColor: 'white',
        width: '100%',
    },
    downloadProgressContainer: {
        backgroundColor: 'gray',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
});
