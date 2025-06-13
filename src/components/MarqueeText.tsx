import React, {useState, useEffect, useRef} from 'react';
import {
    Text,
    View,
    StyleSheet,
    Animated,
    TouchableOpacity,
    Modal,
    Dimensions, ScrollView
} from 'react-native';
import {SpatialNavigationFocusableView} from 'react-tv-space-navigation';

const {width: screenWidth} = Dimensions.get('window');

interface MarqueeProps {
    text: string;
    speed?: number;
    fontSize?: number;
    color?: string;
    detailContent?: string;
}

const MarqueeTextWithModal: React.FC<MarqueeProps> = ({
                                                          text,
                                                          speed = 50,
                                                          fontSize = 16,
                                                          color = '#FFFFFF',
                                                          detailContent = '这里是详情内容'
                                                      }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const translateX = useRef(new Animated.Value(0)).current;
    const textWidth = useRef(0);
    const containerWidth = useRef(20);

    useEffect(() => {
        if (textWidth.current > 0 && containerWidth.current > 0) {
            const animationDuration = (textWidth.current / speed) * 1000;

            // 重置初始位置
            translateX.setValue(containerWidth.current);

            const animation = Animated.loop(
                Animated.timing(translateX, {
                    toValue: -textWidth.current,
                    duration: animationDuration,
                    useNativeDriver: true,
                })
            );

            animation.start();
            return () => animation.stop();
        }
    }, [text, speed, textWidth.current, containerWidth.current]);

    const handleTextLayout = (event: any) => {
        textWidth.current = event.nativeEvent.layout.width;
    };

    return (
        <>
            <SpatialNavigationFocusableView
                onSelect={() => setModalVisible(true)}
            >
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setModalVisible(true)}
                    style={styles.container}
                >
                    <View
                        style={[styles.marqueeContainer, {width: '100%'}]}
                        onLayout={(e) => containerWidth.current = e.nativeEvent.layout.width}
                    >
                        <Animated.Text
                            style={[
                                styles.text,
                                {
                                    fontSize,
                                    color,
                                    transform: [{translateX}]
                                }
                            ]}
                            onLayout={handleTextLayout}
                            numberOfLines={1}
                        >
                            {text}
                        </Animated.Text>
                    </View>
                </TouchableOpacity>
            </SpatialNavigationFocusableView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {},
    marqueeContainer: {
        height: 15,
        overflow: 'hidden',
    },
    text: {
        includeFontPadding: false,
        textAlignVertical: 'center',
    },
    modalContainer: {
        flex: 1,
    },
    modalEpisodeContent: {
        position: 'absolute',
        width: 250,
        height: 300,
        top: 150,
        left: 50,
    },
});

export default MarqueeTextWithModal;
