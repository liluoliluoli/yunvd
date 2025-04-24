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
                    backgroundColor: focused ? '#1a1a1a' : 'transparent',
                    padding: RFPercentage(1.2),
                    borderRadius: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
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
