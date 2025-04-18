import styled from '@emotion/native';
import {SpatialNavigationNode} from 'react-tv-space-navigation';
import {TextInput as RNTextInput} from 'react-native';
import {useRef} from 'react';
import {Typography} from './Typography';
import {Box} from './Box';
import {theme} from "../theme/theme";

/**
 * It works, but it's not perfect.
 * If you press the back button on Android to dismiss the keyboard,
 * focus is in a weird state where we keep listening to remote control arrow movements.
 * Ideally, we'd like to always remove the native focus when the keyboard is dismissed.
 */
export const TextInput = ({placeholder}: { placeholder: string }) => {
    const ref = useRef<RNTextInput>(null);

    return (
        <Box direction={"horizontal"}>
            <SpatialNavigationNode
                isFocusable
                onSelect={() => {
                    ref?.current?.focus();
                }}
                onBlur={() => {
                    ref?.current?.blur();
                }}
            >
                {({isFocused}) => <StyledTextInput ref={ref} isFocused={isFocused} placeholder={placeholder}
                                                   placeholderTextColor={'gray'}/>}
            </SpatialNavigationNode>
        </Box>
    );
};

const StyledTextInput = styled(RNTextInput)<{ isFocused: boolean }>(({isFocused}) => ({
    borderColor: isFocused ? 'white' : 'black',
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: theme.colors.background.mainHover,
    width: '100%',
    paddingLeft: theme.spacings.$4,
}));
