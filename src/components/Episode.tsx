import React, {forwardRef} from 'react';
import {Animated, View, Text} from 'react-native';
import {SpatialNavigationFocusableView} from 'react-tv-space-navigation';
import {Typography} from './Typography';
import styled from '@emotion/native';
import {useFocusAnimation} from '../hooks/useFocusAnimation';
import {scaledPixels} from '../hooks/useScale';
import {Ionicons} from "@expo/vector-icons";
import {theme} from "../theme/theme";

type EpisodeProps = {
    label: string;
    id: number;
    onSelect?: () => void;
};

const EpisodeContent = forwardRef<View, { label: string; isFocused: boolean }>((props, ref) => {
    const {isFocused, label} = props;
    const anim = useFocusAnimation(isFocused);
    return (
        <Container isFocused={isFocused} ref={ref}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
            }}>
                <Ionicons name="play" style={{marginLeft: 5, color: '#fff',}}/>
                <Text style={{marginLeft: 5, color: '#fff',}}>{label}</Text>
            </View>
        </Container>
    );
});

EpisodeContent.displayName = 'EpisodeContent';

export const Episode = ({label, onSelect}: EpisodeProps) => {
    return (
        <SpatialNavigationFocusableView onSelect={onSelect}>
            {({isFocused, isRootActive}) => (
                <EpisodeContent label={label} isFocused={isFocused && isRootActive}/>
            )}
        </SpatialNavigationFocusableView>
    );
};

const Container = styled(Animated.View)<{ isFocused: boolean }>(({isFocused}) => ({
    alignSelf: 'baseline',
    backgroundColor: isFocused ? 'rgba(255, 255, 255, 0.2)' : '#1a1a1a',
    padding: theme.spacings.$4,
    borderRadius: scaledPixels(12),
    cursor: 'pointer',
    width: '100%'
}));

const ColoredTypography = styled(Typography)<{ isFocused: boolean }>(({isFocused}) => ({
    color: isFocused ? 'black' : 'white',
}));
