import styled from '@emotion/native';
import {Image} from 'react-native';
import React from 'react';

const LeftArrowImage = styled(Image)({
    height: 70,
    width: 50,
    transform: [{rotate: '180deg'}],
});

const RightArrowImage = styled(Image)({
    height: 70,
    width: 50,
});

export const LeftArrow = React.memo(() => {
    return <LeftArrowImage resizeMode="stretch" tintColor={'white'} source={require('../../assets/arrow-left.png')}/>;
});
LeftArrow.displayName = 'LeftArrow';

export const RightArrow = React.memo(() => {
    return <RightArrowImage resizeMode="stretch" tintColor={'white'} source={require('../../assets/arrow-left.png')}/>;
});
RightArrow.displayName = 'RightArrow';

const BottomArrowImage = styled(Image)({
    height: 70,
    width: 50,
    transform: [{rotate: '90deg'}],
});

const TopArrowImage = styled(Image)({
    height: 70,
    width: 50,
    transform: [{rotate: '270deg'}],
});

export const BottomArrow = React.memo(() => {
    return <BottomArrowImage resizeMode="stretch" tintColor={'white'} source={require('../../assets/arrow-left.png')}/>;
});
BottomArrow.displayName = 'BottomArrow';

export const TopArrow = React.memo(() => {
    return <TopArrowImage resizeMode="stretch" tintColor={'white'} source={require('../../assets/arrow-left.png')}/>;
});
TopArrow.displayName = 'TopArrow';
