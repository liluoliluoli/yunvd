import {Direction} from '@bam.tech/lrud';
import {useIsFocused} from '@react-navigation/native';
import React, {ReactNode, useCallback, useEffect} from 'react';
import {SpatialNavigationRoot, useLockSpatialNavigation} from 'react-tv-space-navigation';
import {Keyboard, SafeAreaView} from 'react-native';
import {GoBackConfiguration} from '../remote-control/GoBackConfiguration';


type Props = {
    children: ReactNode;
    loadMore?: () => void;
};

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

export const Page = ({children, loadMore}: Props) => {
    const isFocused = useIsFocused();
    const isActive = isFocused;
    const onDirectionHandledWithoutMovement = useCallback(
        (movement: Direction) => {
            if (movement === 'down' && loadMore) {
                loadMore();
            }
        },
        [],
    );

    return (
        <SpatialNavigationRoot
            isActive={isActive}
            onDirectionHandledWithoutMovement={onDirectionHandledWithoutMovement}
        >
            <GoBackConfiguration/>
            <SpatialNavigationKeyboardLocker/>
            {children}
        </SpatialNavigationRoot>

    );
};
