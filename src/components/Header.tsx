import React from 'react';
import {View, Image, StyleSheet} from 'react-native';
import {Button} from "./Button";
import {TextInput} from "./TextInput";
import {Spacer} from "./Spacer";
import {scaledPixels} from "../hooks/useScale";
import {SpatialNavigationNode} from "react-tv-space-navigation";
import {useNavigation} from "@react-navigation/native";

export const Header = ({}) => {
    const navigation = useNavigation<any>();

    const onUpdate = () => {
        console.log('onUpdate');
    }
    const onLogin = () => {
        console.log('onUpdate');
    }
    const onDonate = () => {
        console.log('onUpdate');
    }
    const onFavorite = () => {
        console.log('onUpdate');
    }
    const onSetting = () => {
        console.log('onSetting');
    }

    return (
        <SpatialNavigationNode orientation={'horizontal'}>
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
                <Button label="更新" onSelect={() => navigation.navigate('Search', {keyword: "sdsd"})}/>
                <Spacer direction={"horizontal"} gap={'$6'}/>
                <Button label="登录" onSelect={onLogin}/>
                <Spacer direction={"horizontal"} gap={'$6'}/>
                <Button label="赞赏" onSelect={onDonate}/>
                <Spacer direction={"horizontal"} gap={'$6'}/>
                <Button label="收藏" onSelect={onFavorite}/>
                <Spacer direction={"horizontal"} gap={'$6'}/>
                <Button label="设置" onSelect={onSetting}/>
            </View>
        </SpatialNavigationNode>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: 'gray',
        width: '100%',
    },
    logo: {
        width: 40,
        height: 40,
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
});
