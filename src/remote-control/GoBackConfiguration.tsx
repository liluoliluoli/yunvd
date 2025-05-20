import {useNavigation, useNavigationState} from '@react-navigation/native';
import {SupportedKeys} from '../remote-control/SupportedKeys';
import {useKey} from '../hooks/useKey';
import {useCallback, useEffect, useState} from 'react';
import {BackHandler} from 'react-native';
import Toast from "react-native-simple-toast";

export const GoBackConfiguration = () => {
    const navigation = useNavigation();
    const [lastBackPressTime, setLastBackPressTime] = useState(0);
    const routeName = useNavigationState(state =>
        state.routes[state.index].name
    );

    useEffect(() => {
        const event = BackHandler.addEventListener('hardwareBackPress', () => {
            return true;
        });

        return () => {
            event.remove();
        };
    }, []);

    const goBackOnBackPress = useCallback(
        (pressedKey: SupportedKeys) => {
            if (!navigation.isFocused) {
                return false;
            }
            if (pressedKey !== SupportedKeys.Back) return false;

            const canExitPage = routeName === 'Home' || routeName === 'Login' || routeName === 'SignUp';
            if (canExitPage) {
                const currentTime = Date.now();
                if (currentTime - lastBackPressTime < 2000) {
                    BackHandler.exitApp();
                    return true;
                }
                Toast.show('再按一次退出程序', Toast.SHORT);
                setLastBackPressTime(currentTime);
                return true;
            }

            if (navigation.canGoBack()) {
                navigation.goBack();
                return true;
            }
            return false;
        },
        [navigation, lastBackPressTime],
    );

    useKey(SupportedKeys.Back, goBackOnBackPress);

    return <></>;
};
