import styled from '@emotion/native';
import {SpatialNavigationNode} from 'react-tv-space-navigation';
import {TextInput as RNTextInput} from 'react-native';
import {useEffect, useRef, useState} from 'react';
import {Typography} from './Typography';
import {Box} from './Box';
import {theme} from "../theme/theme";
import {useIsFocused} from "@react-navigation/native";
import {scaledPixels} from "../hooks/useScale";

/**
 * It works, but it's not perfect.
 * If you press the back button on Android to dismiss the keyboard,
 * focus is in a weird state where we keep listening to remote control arrow movements.
 * Ideally, we'd like to always remove the native focus when the keyboard is dismissed.
 */

export const TextInput = ({placeholder, onEnterPress, height, isPassword = false}: {
    placeholder: string,
    onEnterPress: (text: string) => void,
    height?: number,
    isPassword?: boolean
}) => {
    const ref = useRef<RNTextInput>(null);
    const [inputText, setInputText] = useState('');
    const [text, setText] = useState('');
    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            setInputText('');
            setText('');
        }
    }, [isFocused]);

    useEffect(() => {
        if (text) {
            onEnterPress(text);
        }
    }, [text]);

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
                {({isFocused}) => <StyledTextInput ref={ref}
                                                   isFocused={isFocused}
                                                   value={inputText}
                                                   placeholder={placeholder}
                                                   onChangeText={setInputText}
                                                   onSubmitEditing={() => setText(inputText)}
                                                   placeholderTextColor={'gray'}
                                                   height={height}
                                                   secureTextEntry={isPassword}/>}
            </SpatialNavigationNode>
        </Box>
    );
};

const StyledTextInput = styled(RNTextInput)<{ isFocused: boolean, height: number }>(({isFocused, height}) => ({
    borderColor: isFocused ? 'white' : 'black',
    borderBottomWidth: 1,
    backgroundColor: theme.colors.background.mainHover,
    width: '100%',
    paddingLeft: theme.spacings.$4,
    color: 'white',
    height: height,
}));
