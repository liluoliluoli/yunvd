import React, {useState} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuthViewModel from '../viewModels/AuthViewModel';

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
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                <Image source={require('../../assets/icon.png')} style={styles.logo} resizeMode="contain"/>
                <Text style={styles.title}>Welcome to yunvd</Text>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#999"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#999"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        onKeyPress={handleKeyPress}
                        returnKeyType="go"
                        onSubmitEditing={isFormValid ? handleLogin : null}
                    />

                    <TouchableOpacity style={styles.forgotPasswordContainer}
                                      onPress={() => navigation.navigate('ForgotPassword')}>
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.loginButton, {opacity: isFormValid ? 1 : 0.5}]}
                        onPress={handleLogin}
                        disabled={!isFormValid || isLoading}
                    >
                        {isLoading ? <ActivityIndicator color="#fff"/> : <Text style={styles.buttonText}>Log In</Text>}
                    </TouchableOpacity>
                </View>

                <View style={styles.signupContainer}>
                    <Text style={styles.signupText}>Don't have an account?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                        <Text style={styles.signupLink}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#333',
    },
    inputContainer: {
        width: '100%',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#f5f5f5',
        borderRadius: 5,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    forgotPasswordContainer: {
        alignSelf: 'flex-end',
        marginBottom: 20,
    },
    forgotPasswordText: {
        color: '#f44336',
        fontSize: 14,
    },
    loginButton: {
        backgroundColor: '#f44336',
        padding: 15,
        borderRadius: 5,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    signupContainer: {
        flexDirection: 'row',
        marginTop: 20,
    },
    signupText: {
        color: '#666',
        fontSize: 14,
        marginRight: 5,
    },
    signupLink: {
        color: '#f44336',
        fontSize: 14,
        fontWeight: '600',
    },
});
