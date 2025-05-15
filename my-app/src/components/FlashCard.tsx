import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
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
    
    // Add a slight wobble effect at the end of the flip
    const scaleValue = interpolate(
      rotation.value,
      [0, 0.5, 0.6, 0.8, 1],
      [1, 0.95, 1.05, 1.02, 1],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [
        { perspective: 1500 },
        { rotateY: `${rotateValue}deg` },
        { scale: scaleValue },
      ],
      backfaceVisibility: 'hidden',
      opacity: rotation.value >= 0.5 ? 0 : 1,
      position: 'absolute',
      width: '100%',
      height: '100%',
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(
      rotation.value,
      [0, 1],
      [180, 360],
      Extrapolate.CLAMP
    );
    
    // Add a slight wobble effect at the end of the flip
    const scaleValue = interpolate(
      rotation.value,
      [0, 0.2, 0.4, 0.5, 1],
      [1, 1.02, 1.05, 0.95, 1],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [
        { perspective: 1500 },
        { rotateY: `${rotateValue}deg` },
        { scale: scaleValue },
      ],
      backfaceVisibility: 'hidden',
      opacity: rotation.value >= 0.5 ? 1 : 0,
      position: 'absolute',
      width: '100%',
      height: '100%',
    };
  });

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handleFlip = () => {
    // Add a touch feedback effect
    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    
    // Execute the flip with a more sophisticated animation
    const newValue = isFlipped ? 0 : 1;
    rotation.value = withTiming(newValue, {
      duration: 600,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1.1),
    });
    
    setIsFlipped(!isFlipped);
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.cardShadow, cardAnimatedStyle]}>
        <Pressable onPress={handleFlip} style={styles.cardContainer}>
          <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
            <Text style={styles.cardText}>{card.front}</Text>
            {!reviewMode && (
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.iconButton} 
                  onPress={onEdit}
                  activeOpacity={0.7}
                >
                  <Text style={styles.iconText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.iconButton} 
                  onPress={onDelete}
                  activeOpacity={0.7}
                >
                  <Text style={styles.iconText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
          <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
            <Text style={styles.cardText}>{card.back}</Text>
            {!reviewMode && (
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.iconButton} 
                  onPress={onEdit}
                  activeOpacity={0.7}
                >
                  <Text style={styles.iconText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.iconButton} 
                  onPress={onDelete}
                  activeOpacity={0.7}
                >
                  <Text style={styles.iconText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 200,
    marginVertical: 10,
  },
  cardShadow: {
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
    fontWeight: '500',
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