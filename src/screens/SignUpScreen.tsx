import React, {useState} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import {useAuthViewModel} from '../viewModels/AuthViewModel';
import {SpatialNavigationNode, SpatialNavigationScrollView} from "react-tv-space-navigation";
import {BottomArrow, TopArrow} from "../components/Arrows";
import {Typography} from "../components/Typography";
import {Spacer} from "../components/Spacer";
import {scaledPixels} from "../hooks/useScale";
import {Button} from "../components/Button";
import {Page} from "../components/Page";
import {TextInput} from "../components/TextInput";
import {HEADER_SIZE} from "../utils/ApiConstants";
import Toast from "react-native-simple-toast";

export default function SignUpScreen({navigation}) {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const {
        register,
        isLoading,
        error,
        clearError
    } = useAuthViewModel();

    const handleSignUp = async () => {
        clearError();

        if (!userName.trim()) {
            Alert.alert('Error', '用户名必填');
            return;
        }
        if (!password.trim()) {
            Alert.alert('Error', '密码必填');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', '密码不匹配');
            return;
        }

        const success = await register({
            userName,
            password,
            confirmPassword
        });

        if (success) {
            Toast.show("账号创建成功", Toast.SHORT);
            navigation.navigate('Login');
        } else if (error) {
            Toast.show("账号创建失败", Toast.SHORT);
        }
    };

    return (
        <Page>
            <View style={styles.container}>
                <SpatialNavigationScrollView
                    offsetFromStart={HEADER_SIZE + 20}
                    descendingArrow={<TopArrow/>}
                    ascendingArrow={<BottomArrow/>}
                    descendingArrowContainerStyle={styles.topArrowContainer}
                    ascendingArrowContainerStyle={styles.bottomArrowContainer}
                    contentContainerStyle={{flex: 1, justifyContent: 'center'}}
                >
                    <SpatialNavigationNode orientation={'vertical'}>
                        <View style={styles.formContainer}>
                            <Image source={require('../../assets/icon.png')} style={styles.logo}
                                   resizeMode="contain"/>
                            <Typography variant="title">创建账号</Typography>
                            <Spacer direction={"vertical"} gap={'$6'}/>
                            <View style={styles.inputContainer}>
                                <TextInput placeholder='用户名' onEnterPress={setUserName}
                                           height={scaledPixels(100)}/>
                                <Spacer direction={"vertical"} gap={'$6'}/>
                                <TextInput placeholder='密码' onEnterPress={setPassword}
                                           height={scaledPixels(100)} isPassword={true}/>
                                <Spacer direction={"vertical"} gap={'$6'}/>
                                <TextInput placeholder='确认密码' onEnterPress={setConfirmPassword}
                                           height={scaledPixels(100)} isPassword={true}/>
                            </View>
                            <Spacer direction={"vertical"} gap={'$6'}/>
                            <Button label="注册" onSelect={handleSignUp}/>
                            <Spacer direction={"vertical"} gap={'$6'}/>
                            <View style={{flexDirection: 'row'}}>
                                <Text style={styles.text}>已经有账号?</Text>
                                <Spacer direction={"horizontal"} gap={'$3'}/>
                                <Button label="登录" onSelect={() => navigation.navigate('Login')}/>
                            </View>
                        </View>
                    </SpatialNavigationNode>
                </SpatialNavigationScrollView>
            </View>
        </Page>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 2,
        paddingRight: 2
    },
    formContainer: {
        width: '100%',
        alignItems: 'center',
    },
    inputContainer: {
        width: scaledPixels(800),
    },
    text: {
        color: 'white',
        marginTop: 5,
        fontSize: 12,
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
    logo: {
        width: 80,
        height: 80,
    },
});
