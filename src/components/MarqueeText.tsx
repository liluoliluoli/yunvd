import React, {useState, useEffect, useRef} from 'react';
import {
    Text,
    View,
    StyleSheet,
    Animated,
    TouchableOpacity,
    Modal,
    Dimensions, ScrollView, Image
} from 'react-native';
import {SpatialNavigationFocusableView} from 'react-tv-space-navigation';
import {Typography} from "./Typography";

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
                {({isFocused, isRootActive}) => (
                    <View
                        style={[styles.marqueeContainer, {
                            width: '100%',
                            borderWidth: isFocused ? 1 : 0,
                            borderColor: 'rgba(255, 255, 255, 0.5)',
                            borderRadius: 3,
                            height: 25,
                            paddingTop: 5,
                        }]}
                        onLayout={(e) => containerWidth.current = e.nativeEvent.layout.width}
                    >
                        <Animated.Text
                            style={[
                                styles.text,
                                {
                                    fontSize,
                                    color,
                                    transform: [{translateX}],
                                }
                            ]}
                            onLayout={handleTextLayout}
                            numberOfLines={1}
                        >
                            {text}
                        </Animated.Text>
                    </View>
                )}
            </SpatialNavigationFocusableView>
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <Typography variant="body">{detailContent} </Typography>
                </TouchableOpacity>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
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
