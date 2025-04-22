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
import useAuthViewModel from '../viewModels/AuthViewModel';
import {Page} from "../components/Page";
import {SpatialNavigationNode, SpatialNavigationScrollView} from "react-tv-space-navigation";
import {BottomArrow, TopArrow} from "../components/Arrows";
import {scaledPixels} from "../hooks/useScale";
import {TextInput} from "../components/TextInput";
import {Button} from "../components/Button";

const HEADER_SIZE = scaledPixels(400);
export default function LoginScreen({navigation}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const {
        login,
        error,
        clearError
    } = useAuthViewModel();
    const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);
    const isFormValid = email.trim() !== '' && password.trim() !== '';

    const handleLogin = async () => {
        if (!isValidEmail(email)) {
            Alert.alert('Error', 'Enter a valid email address');
            return;
        }
        if (!password.trim()) {
            Alert.alert('Error', 'Password is required');
            return;
        }

        try {
            setIsLoading(true);
            if (await login(email, password)) {
                await AsyncStorage.setItem('userToken', 'demo-token-' + Date.now());
                navigation.navigate('Home');
            }
        } catch (error) {
            console.error('Login Error:', error);
            Alert.alert('Login Failed', 'An error occurred during login.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = ({nativeEvent: {key}}) => {
        if (key === 'Enter' && isFormValid) {
            handleLogin();
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
                            <Image source={require('../../assets/icon.png')} style={styles.logo} resizeMode="contain"/>
                            <Text style={styles.text}>Welcome to yunvd</Text>
                            <View style={styles.inputContainer}>
                                <TextInput placeholder='Email' onEnterPress={setEmail}/>
                                <TextInput placeholder='Password' onEnterPress={setPassword}/>
                            </View>

                            <Button label="登录" onSelect={handleLogin}/>

                            <Text style={styles.text}>Don't have an account?</Text>
                            <Button label="注册" onSelect={() => navigation.navigate('SignUp')}/>
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
        backgroundColor: '#111111',
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputContainer: {
        width: scaledPixels(800),
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        borderWidth: 0,
    },
    logo: {
        width: 80,
        height: 80,
        marginBottom: 20,
    },
    text: {
        color: 'white',
        marginBottom: 30,
        fontSize: 20,
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
