import React, {useEffect, useCallback} from 'react';
import {useRouter} from 'expo-router';
import RemoteControlManager from './RemoteControlManager';
import {SupportedKeys} from './SupportedKeys';

export const GoBackConfiguration: React.FC = () => {
    const router = useRouter();

    const handleBackPress = useCallback(() => {
        if (router.canGoBack()) {
            router.back();
        }
    }, [router]);

    useEffect(() => {
        const remoteControlListener = (pressedKey: SupportedKeys) => {
            if (pressedKey === SupportedKeys.Back) {
                handleBackPress();
            }
        };

        RemoteControlManager.addKeydownListener(remoteControlListener);
        return () => RemoteControlManager.removeKeydownListener(remoteControlListener);
    }, [handleBackPress]);

    return null;
};
