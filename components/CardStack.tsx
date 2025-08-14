import React, { useRef } from 'react';
import {
    View,
    Text,
    Pressable,
    Animated,
    Dimensions,
    StyleSheet,
} from 'react-native';

const CARD_COUNT = 6;
const SCREEN_WIDTH = Dimensions.get('window').width;
export const CARD_WIDTH = SCREEN_WIDTH * 0.4;
export const CARD_HEIGHT = CARD_WIDTH * 1.4;
const CARD_MARGIN = 12;

type Props = {
    onExpand: () => void;
};

export default function CardStack({ onExpand }: Props) {
    const stackStartX = (SCREEN_WIDTH - CARD_WIDTH) / 2;
    const stackStartY = 0;

    const animations = useRef(
        [...Array(CARD_COUNT)].map((_, index) => ({
            position: new Animated.ValueXY({ x: stackStartX, y: stackStartY }),
            rotate: new Animated.Value(1),
            index,
        }))
    ).current;

    const handlePress = () => {
        const gridWidth = CARD_WIDTH * 2 + CARD_MARGIN;
        const startX = (SCREEN_WIDTH - gridWidth) / 2;

        const animationsList = animations.map((anim) => {
            const i = anim.index;
            const col = i % 2;
            const row = Math.floor(i / 2);

            const toX = startX + col * (CARD_WIDTH + CARD_MARGIN);
            const toY = row * (CARD_HEIGHT + CARD_MARGIN);

            return Animated.parallel([
                Animated.timing(anim.position, {
                    toValue: { x: toX, y: toY },
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(anim.rotate, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]);
        });

        Animated.stagger(80, animationsList).start(() => {
            setTimeout(() => {
                onExpand();
            }, 300);
        });
    };

    return (
        <Pressable onPress={handlePress}>
            <View style={styles.wrapper}>
                <View style={styles.stackContainer}>
                    {[...animations].map((anim) => {
                        const i = anim.index;
                        const initialOffsetY = i * 4;
                        const initialRotate = -3 + i * 1.5;

                        const rotate = anim.rotate.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', `${initialRotate}deg`],
                        });

                        return (
                            <Animated.View
                                key={i}
                                style={[
                                    styles.card,
                                    {
                                        transform: [
                                            { translateX: anim.position.x },
                                            { translateY: Animated.add(anim.position.y, new Animated.Value(initialOffsetY)) },
                                            { rotate },
                                        ],
                                    },
                                ]}
                            >
                                <Text style={styles.cardText}>카드 {i + 1}</Text>
                            </Animated.View>
                        );
                    }).reverse()}
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginTop: 48,
        width: '100%',
        alignItems: 'center',
    },
    stackContainer: {
        height: 800,
        width: '100%',
        position: 'relative',
    },
    card: {
        position: 'absolute',
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        backgroundColor: '#fff',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    cardText: {
        fontWeight: 'bold',
        fontSize: 18,
    },
});
