import React, {useState} from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import {
    SpatialNavigationFocusableView, SpatialNavigationNodeRef,
    SpatialNavigationView
} from "react-tv-space-navigation";
import {scaledPixels} from "../hooks/useScale";
import {useIsFocused} from '@react-navigation/native';

interface TabBarProps {
    routes: Array<{ key: string, title: string, screen: string }>;
    onTabPress: (index: number) => void;
    currentIndex: number;
    randomNum?: number
}

export const TabBar = ({routes, onTabPress, currentIndex}: TabBarProps) => {
    const [index, setIndex] = useState(currentIndex)
    const tabRefs = React.useRef<Array<React.RefObject<SpatialNavigationNodeRef>>>([]);
    const isFocused = useIsFocused();
    React.useEffect(() => {
        tabRefs.current = routes.map(() => React.createRef());
    }, [routes]);

    React.useEffect(() => {
        if (tabRefs.current[index]?.current && isFocused) {
            tabRefs.current[index].current?.focus();
        }
    }, [tabRefs.current[index], isFocused]);
    return (
        <View>
            <SpatialNavigationView style={styles.tabBarContainer} direction="horizontal">
                {routes.map((route, i) => (
                    <SpatialNavigationFocusableView
                        key={route.key}
                        style={{flex: 1}}
                        onSelect={() => onTabPress(i)}
                        ref={tabRefs.current[i]}
                    >
                        {({isFocused, isRootActive}) => {
                            return (
                                <View style={[
                                    styles.tabItem,
                                    index === i && styles.activeTabItem,
                                    isFocused && isRootActive && styles.focusedTabItem
                                ]}>
                                    <Animated.Text style={[
                                        styles.tabText,
                                        index === i && styles.activeTabText
                                    ]}>
                                        {route.title}
                                    </Animated.Text>
                                </View>
                            )
                        }}
                    </SpatialNavigationFocusableView>
                ))}
            </SpatialNavigationView>
            <View style={{height: 3}}></View>
        </View>
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
        backgroundColor: 'black',
        borderTopWidth: 1,
        borderRightWidth: 1,
        borderLeftWidth: 1,
        borderBottomWidth: 1,
        borderTopColor: 'gray',
        borderRightColor: 'gray',
        borderLeftColor: 'gray',
        borderBottomColor: 'gray',
    },
    focusedTabItem: {
        borderBottomColor: 'white',
        borderBottomWidth: 2,
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
