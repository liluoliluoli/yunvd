import {forwardRef} from 'react';
import {Animated, View} from 'react-native';
import {SpatialNavigationFocusableView} from 'react-tv-space-navigation';
import {Typography} from './Typography';
import styled from '@emotion/native';
import {useFocusAnimation} from '../hooks/useFocusAnimation';
import {scaledPixels} from '../hooks/useScale';
import {theme} from "../theme/theme";

type ButtonProps = {
    label: string;
    hidden?: boolean;
    onSelect?: () => void;
};

const ButtonContent = forwardRef<View, { label: string; isFocused: boolean; hidden: boolean }>((props, ref) => {
    const {isFocused, label, hidden} = props;
    const anim = useFocusAnimation(isFocused);
    return (
        <Container style={anim} isFocused={isFocused} hidden={hidden} ref={ref}>
            <ColoredTypography isFocused={isFocused}>{label}</ColoredTypography>
        </Container>
    );
});

ButtonContent.displayName = 'ButtonContent';

export const Button = ({label, onSelect, hidden}: ButtonProps) => {
    return (
        <SpatialNavigationFocusableView onSelect={onSelect}>
            {({isFocused, isRootActive}) => (
                <ButtonContent label={label} isFocused={isFocused && isRootActive} hidden={hidden}/>
            )}
        </SpatialNavigationFocusableView>
    );
};

const Container = styled(Animated.View)<{ isFocused: boolean; hidden: boolean }>(({isFocused, hidden}) => ({
    alignSelf: 'baseline',
    backgroundColor: isFocused ? 'rgba(255, 255, 255, 0.9)' : 'black',
    padding: scaledPixels(10),
    borderRadius: scaledPixels(8),
    cursor: 'pointer',
    display: hidden ? 'none' : 'flex',
}));

const ColoredTypography = styled(Typography)<{ isFocused: boolean }>(({isFocused}) => ({
    color: isFocused ? 'black' : 'white',
}));
