import React, {forwardRef, useCallback} from 'react';
import {
    Pressable,
    PressableProps,
    PressableStateCallbackType,
    StyleProp,
    View,
    ViewStyle,
} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';

export type StyleType = (
    state: PressableStateCallbackType,
) => StyleProp<ViewStyle>;

export const CustomControlPressable = forwardRef<View, PressableProps>(
    ({children, style, ...props}, ref) => {
        const _style = useCallback<StyleType>(
            ({focused}) => [
                style as ViewStyle,
                {
                    backgroundColor: 'transparent',
                    padding: RFPercentage(0.8),
                    borderRadius: 10,
                    opacity: focused ? 1 : 0.5,
                },
            ],
            [style],
        );

        return (
            <Pressable ref={ref} style={_style} {...props}>
                {children}
            </Pressable>
        );
    },
);
