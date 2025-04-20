import React from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import {
    SpatialNavigationFocusableView, SpatialNavigationNodeRef,
    SpatialNavigationView
} from "react-tv-space-navigation";
import {scaledPixels} from "../hooks/useScale";

interface TabBarProps {
    routes: Array<{ key: string, title: string, screen: string, ref?: React.RefObject<SpatialNavigationNodeRef> }>;
    initialIndex?: number;
    onTabPress: (index: number) => void;
    currentIndex: number;
}

export const TabBar = ({routes, initialIndex = 0, onTabPress, currentIndex}: TabBarProps) => {
    const tabRefs = React.useRef<Array<React.RefObject<SpatialNavigationNodeRef>>>([]);

    // 初始化 refs
    React.useEffect(() => {
        tabRefs.current = routes.map(() => React.createRef());
    }, [routes]);

    React.useEffect(() => {
        if (tabRefs.current[currentIndex]?.current) {
            tabRefs.current[currentIndex].current?.focus();
        }
    }, [currentIndex]);
    return (
        <SpatialNavigationView style={styles.tabBarContainer} direction="horizontal">
            {routes.map((route, i) => (
                <SpatialNavigationFocusableView
                    key={route.key}
                    style={{flex: 1}}
                    onSelect={() => onTabPress(i)}
                    ref={route.ref}
                >
                    {({isFocused, isRootActive}) => (
                        <View style={[
                            styles.tabItem,
                            currentIndex === i && styles.activeTabItem,
                            isFocused && isRootActive && styles.focusedTabItem
                        ]}>
                            <Animated.Text style={[
                                styles.tabText,
                                currentIndex === i && styles.activeTabText
                            ]}>
                                {route.title}
                            </Animated.Text>
                        </View>
                    )}
                </SpatialNavigationFocusableView>
            ))}
        </SpatialNavigationView>
    );
};

const styles = StyleSheet.create({
    tabBarContainer: {
        flexDirection: 'row',
        height: scaledPixels(100),
        backgroundColor: 'black',
    },
    tabItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTabItem: {
        backgroundColor: 'green',
    },
    focusedTabItem: {
        borderColor: 'white',
    },
    tabText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    activeTabText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
