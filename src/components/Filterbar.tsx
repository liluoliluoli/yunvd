import React, {useState} from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import {
    SpatialNavigationFocusableView, SpatialNavigationNodeRef,
    SpatialNavigationView
} from "react-tv-space-navigation";
import {scaledPixels} from "../hooks/useScale";
import {useIsFocused} from '@react-navigation/native';
import {theme} from "../theme/theme";

interface FilterBarProps {
    routes: Array<{ key: string, label: string }>;
    onTabPress: (index: number) => void;
    currentIndex: number;
}

export const FilterBar = ({routes, onTabPress, currentIndex}: FilterBarProps) => {
    const [index, setIndex] = useState(currentIndex)
    const tabRefs = React.useRef<Array<React.RefObject<SpatialNavigationNodeRef>>>([]);
    const isFocused = useIsFocused();
    React.useEffect(() => {
        tabRefs.current = routes.map(() => React.createRef());
    }, [routes]);

    const handlePress = (i) => {
        setIndex(i);
        onTabPress(i)
    };
    return (
        <SpatialNavigationView style={styles.tabBarContainer} direction="horizontal">
            {routes.map((route, i) => (
                <SpatialNavigationFocusableView
                    key={route.key}
                    onSelect={() => handlePress(i)}
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
                                    {route.label}
                                </Animated.Text>
                            </View>
                        )
                    }}
                </SpatialNavigationFocusableView>
            ))}
        </SpatialNavigationView>
    );
};

const styles = StyleSheet.create({
    tabBarContainer: {
        height: scaledPixels(55),
        backgroundColor: 'black',
    },
    tabItem: {
        height: scaledPixels(50),
        backgroundColor: 'black',
        alignSelf: 'baseline',
        padding: theme.spacings.$4,
        borderRadius: scaledPixels(1),
        borderWidth: 0,
        marginRight: theme.spacings.$4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    focusedTabItem: {
        borderBottomColor: 'white',
        borderBottomWidth: 1,
    },
    activeTabText: {
        color: 'white',
    },
    activeTabItem: {
        backgroundColor: 'black',
        borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabText: {
        color: 'gray',
        fontSize: 12,
        height: scaledPixels(35),
    },
});
