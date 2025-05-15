import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming
} from 'react-native-reanimated';
import { Card } from '../types';

interface FlashCardProps {
  card: Card;
  onEdit?: () => void;
  onDelete?: () => void;
  reviewMode?: boolean;
}

export const FlashCard: React.FC<FlashCardProps> = ({
  card,
  onEdit,
  onDelete,
  reviewMode = false,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(
      rotation.value,
      [0, 1],
      [0, 180],
      Extrapolate.CLAMP
    );
    
    const scaleValue = interpolate(
      rotation.value,
      [0, 0.5, 1],
      [1, 1.05, 1],
      Extrapolate.CLAMP
    );
    
    const opacity = rotation.value <= 0.5 ? 1 : 0;
    
    return {
      transform: [
        { perspective: 1200 },
        { rotateY: `${rotateValue}deg` },
        { scale: scaleValue },
      ],
      opacity,
      position: 'absolute',
      width: '100%',
      height: '100%',
      backfaceVisibility: 'hidden',
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(
      rotation.value,
      [0, 1],
      [180, 360],
      Extrapolate.CLAMP
    );
    
    const scaleValue = interpolate(
      rotation.value,
      [0, 0.5, 1],
      [1, 1.05, 1],
      Extrapolate.CLAMP
    );
    
    const opacity = rotation.value > 0.5 ? 1 : 0;
    
    return {
      transform: [
        { perspective: 1200 },
        { rotateY: `${rotateValue}deg` },
        { scale: scaleValue },
      ],
      opacity,
      position: 'absolute',
      width: '100%',
      height: '100%',
      backfaceVisibility: 'hidden',
    };
  });

  const containerScaleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handleFlip = () => {
    const newValue = isFlipped ? 0 : 1;
    
    scale.value = withTiming(1.03, { duration: 150 });
    
    rotation.value = withTiming(newValue, {
      duration: 500,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    }, () => {
      scale.value = withDelay(100, withTiming(1, { duration: 200 }));
    });
    
    setIsFlipped(!isFlipped);
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={handleFlip} style={styles.cardContainer}>
        <Animated.View style={[styles.cardWrapper, containerScaleStyle]}>
          <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
            <Text style={styles.cardText}>{card.front}</Text>
            {!reviewMode && (
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.iconButton} onPress={onEdit}>
                  <Text style={styles.iconText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={onDelete}>
                  <Text style={styles.iconText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
          <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
            <Text style={styles.cardText}>{card.back}</Text>
            {!reviewMode && (
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.iconButton} onPress={onEdit}>
                  <Text style={styles.iconText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={onDelete}>
                  <Text style={styles.iconText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </Animated.View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 200,
    marginVertical: 10,
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFront: {
    backgroundColor: '#4a69bd',
  },
  cardBack: {
    backgroundColor: '#60a3bc',
  },
  cardText: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
  },
  actionButtons: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
  },
  iconButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 5,
    marginLeft: 8,
  },
  iconText: {
    color: 'white',
    fontSize: 16,
  },
});

export default FlashCard; 