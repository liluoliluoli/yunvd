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
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuthViewModel} from '../viewModels/AuthViewModel';
import {Page} from "../components/Page";
import {SpatialNavigationNode, SpatialNavigationScrollView} from "react-tv-space-navigation";
import {BottomArrow, TopArrow} from "../components/Arrows";
import {scaledPixels} from "../hooks/useScale";
import {TextInput} from "../components/TextInput";
import {Button} from "../components/Button";
import {Typography} from "../components/Typography";
import {Spacer} from "../components/Spacer";
import {HEADER_SIZE} from "../utils/ApiConstants";

export default function LoginScreen({navigation}) {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const {
        login,
        error,
        clearError
    } = useAuthViewModel();

    const handleLogin = async () => {
        if (!userName.trim()) {
            Alert.alert('Error', 'userName is required');
            return;
        }
        if (!password.trim()) {
            Alert.alert('Error', 'Password is required');
            return;
        }

        try {
            setIsLoading(true);
            if (await login(userName, password)) {
                navigation.navigate('Home');
            }
        } catch (error) {
            console.error('Login Error:', error);
            Alert.alert('Login Failed', 'An error occurred during login.');
        } finally {
            setIsLoading(false);
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
                            <Typography variant="title">Welcome to YunVD</Typography>
                            <Spacer direction={"vertical"} gap={'$6'}/>
                            <View style={styles.inputContainer}>
                                <TextInput placeholder='用户名' onEnterPress={setUserName}
                                           height={scaledPixels(100)}/>
                                <Spacer direction={"vertical"} gap={'$6'}/>
                                <TextInput placeholder='密码' onEnterPress={setPassword}
                                           height={scaledPixels(100)} isPassword={true}/>
                            </View>
                            <Spacer direction={"vertical"} gap={'$6'}/>
                            <Button label="登录" onSelect={handleLogin}/>
                            <Spacer direction={"vertical"} gap={'$6'}/>
                            <View style={{flexDirection: 'row'}}>
                                <Text style={styles.text}>还没有账号?</Text>
                                <Spacer direction={"horizontal"} gap={'$3'}/>
                                <Button label="注册" onSelect={() => navigation.navigate('SignUp')}/>
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
    },
    inputContainer: {
        width: scaledPixels(800),
    },
    logo: {
        width: 80,
        height: 80,
    },
    text: {
        color: 'white',
        fontSize: 12,
        marginTop: 5,
    },
    formContainer: {
        width: '100%',
        alignItems: 'center',
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
