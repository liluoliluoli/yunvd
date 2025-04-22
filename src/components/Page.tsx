import {Direction} from '@bam.tech/lrud';
import {useIsFocused} from '@react-navigation/native';
import React, {ReactNode, useCallback, useEffect} from 'react';
import {SpatialNavigationRoot, useLockSpatialNavigation} from 'react-tv-space-navigation';
import {Keyboard} from 'react-native';
import {GoBackConfiguration} from '../remote-control/GoBackConfiguration';
import Toast from 'react-native-toast-message';


type Props = { children: ReactNode };

/**
 * Locks/unlocks the navigator when the native keyboard is shown/hidden.
 * Allows for the native focus to take over when the keyboard is open,
 * and to go back to our own system when the keyboard is closed.
 */
const SpatialNavigationKeyboardLocker = () => {
    const lockActions = useLockSpatialNavigation();
    useEffect(() => {
        const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
            lockActions.lock();
        });
        const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
            lockActions.unlock();
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, [lockActions]);

    return null;
};

export const Page = ({children}: Props) => {
    const isFocused = useIsFocused();
    const isActive = isFocused;
    console.log("Page isActive:" + isActive)
    const onDirectionHandledWithoutMovement = useCallback(
        (movement: Direction) => {
        },
        [],
    );

    return (
        <SpatialNavigationRoot
            isActive={isActive}
            onDirectionHandledWithoutMovement={onDirectionHandledWithoutMovement}
        >
            <Toast/>
            <GoBackConfiguration/>
            <SpatialNavigationKeyboardLocker/>
            {children}
        </SpatialNavigationRoot>
    );
};
