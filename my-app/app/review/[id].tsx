import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';
import FlashCard from '../../src/components/FlashCard';
import { RootState } from '../../src/store';
import { resetCardReviewDate, updateCardReviewCount } from '../../src/store/deckSlice';
import { Card, Deck } from '../../src/types';

export default function ReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useDispatch();
  const decks = useSelector((state: RootState) => state.decks.decks);
  const deck = decks.find((d: Deck) => d.id === id) as Deck | undefined;
  
  const [activeCards, setActiveCards] = useState<Card[]>([]);
  const [completedCards, setCompletedCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isReviewComplete, setIsReviewComplete] = useState(false);
  const [reviewedCards, setReviewedCards] = useState<string[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [reviewCycle, setReviewCycle] = useState(1);
  
  const cardPosition = useSharedValue(0);
  const cardOpacity = useSharedValue(1);

  // Function to check if all cards have been mastered (reviewed 10 times correctly)
  const areAllCardsMastered = useCallback((cardsToCheck: Card[]) => {
    return cardsToCheck.every(card => (card.reviewCount || 0) >= 10);
  }, []);

  // Ensure all cards have reviewCount initialized
  const initializeCards = useCallback((cards: Card[]): Card[] => {
    return cards.map(card => ({
      ...card,
      reviewCount: card.reviewCount || 0,
      nextReviewDate: card.nextReviewDate || undefined
    }));
  }, []);

  useEffect(() => {
    if (deck && deck.cards.length > 0) {
      // Filter out cards that are on cooldown (have a future nextReviewDate)
      const now = Date.now();
      const availableCards = deck.cards.filter(card => {
        // Check if card has a future review date and reset it if needed
        if (card.nextReviewDate && card.nextReviewDate <= now) {
          dispatch(resetCardReviewDate({ deckId: deck.id, cardId: card.id }));
          return true;
        }
        // Include cards with no nextReviewDate or a past nextReviewDate
        return !card.nextReviewDate;
      });

      if (availableCards.length === 0) {
        Alert.alert(
          "No Cards Available", 
          "All cards in this deck have been reviewed and are on cooldown. Come back later to review again.",
          [{ text: "OK", onPress: () => router.back() }]
        );
        return;
      }

      // Shuffle available cards, initialize them, and set as active cards
      const shuffled = [...availableCards].sort(() => Math.random() - 0.5);
      setActiveCards(initializeCards(shuffled));
      setCompletedCards([]);
    }
  }, [deck, dispatch, initializeCards]);

  const handleCardReviewed = useCallback((cardId: string, wasCorrect: boolean) => {
    // Update review count and handle cooldown logic
    dispatch(updateCardReviewCount({ 
      deckId: deck!.id, 
      cardId, 
      wasCorrect 
    }));
    
    setReviewedCards((prev) => [...prev, cardId]);
    
    // Update correct/incorrect counters
    if (wasCorrect) {
      setCorrectCount(prev => prev + 1);
    } else {
      setIncorrectCount(prev => prev + 1);
    }
    
    // Move to next card with animation
    cardOpacity.value = withTiming(0, { duration: 200, easing: Easing.ease }, () => {
      runOnJS(moveToNextCard)(wasCorrect, cardId);
    });
  }, [deck, dispatch, cardOpacity]);

  const moveToNextCard = useCallback((wasCorrect: boolean, currentCardId: string) => {
    // Update the active and completed card arrays
    const currentCardIndex = activeCards.findIndex(card => card.id === currentCardId);
    if (currentCardIndex !== -1) {
      const currentCard = activeCards[currentCardIndex];
      const updatedCard = {
        ...currentCard,
        reviewCount: wasCorrect 
          ? ((currentCard.reviewCount || 0) + 1)
          : 0,
      };
      
      // Create new arrays to ensure React detects the state change
      const newActiveCards = [...activeCards];
      newActiveCards.splice(currentCardIndex, 1); // Remove the current card
      
      if (wasCorrect && updatedCard.reviewCount >= 10) {
        // If the card reached 10 correct reviews, move to completed
        setCompletedCards(prev => [...prev, updatedCard]);
      } else {
        // Otherwise put it back into the active pile (at the end)
        newActiveCards.push(updatedCard);
      }
      
      setActiveCards(newActiveCards);
    }
    
    // Check if we need to move to the next card or if we're done
    if (activeCards.length <= 1 && completedCards.length === deck!.cards.length) {
      // All cards have been completed
      setIsReviewComplete(true);
    } else if (currentIndex < activeCards.length - 1) {
      // Move to the next card
      setCurrentIndex(currentIndex + 1);
      cardPosition.value = 0;
      cardOpacity.value = withTiming(1, { duration: 200 });
    } else {
      // Reset to the beginning of the remaining active cards
      setCurrentIndex(0);
      cardPosition.value = 0;
      cardOpacity.value = withTiming(1, { duration: 200 });
      setReviewCycle(cycle => cycle + 1);
      
      // Reshuffle cards for the next cycle
      setActiveCards(cards => [...cards].sort(() => Math.random() - 0.5));
    }
  }, [currentIndex, activeCards, completedCards, deck, cardPosition, cardOpacity]);

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: cardPosition.value }],
      opacity: cardOpacity.value,
    };
  });

  if (!deck) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Deck not found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  if (isReviewComplete) {
    return (
      <View style={styles.completeContainer}>
        <Text style={styles.completeTitle}>Review Complete!</Text>
        <Text style={styles.completeText}>
          All cards have been reviewed 10 times correctly!
        </Text>
        <Text style={styles.statsText}>
          Correct: {correctCount} | Incorrect: {incorrectCount}
        </Text>
        <Text style={styles.reviewCycles}>
          Completed in {reviewCycle} review cycles
        </Text>
        <View style={styles.completionInfo}>
          <Text style={styles.infoText}>
            All cards have been put on cooldown and will be available again in one week.
          </Text>
        </View>
        <Button title="Return to Deck" onPress={() => router.back()} />
      </View>
    );
  }

  if (activeCards.length === 0 && completedCards.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>No cards in this deck to review</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  // Only proceed if we have active cards
  if (activeCards.length === 0) {
    return (
      <View style={styles.loadingState}>
        <Text style={styles.loadingText}>Loading cards...</Text>
      </View>
    );
  }

  const currentCard = activeCards[currentIndex];
  // Add null check for reviewCount
  const reviewCount = currentCard?.reviewCount || 0;
  const needsCorrectReviews = 10 - reviewCount;
  const totalRemaining = activeCards.length;
  const totalCompleted = completedCards.length;
  const totalCards = totalRemaining + totalCompleted;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{deck.name} - Review</Text>
        <Text style={styles.progress}>
          Card {currentIndex + 1} of {activeCards.length} (Cycle {reviewCycle})
        </Text>
        <Text style={styles.reviewCount}>
          {needsCorrectReviews > 0 
            ? `${needsCorrectReviews} more correct reviews until mastered` 
            : "This card will be mastered after this review"}
        </Text>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${(totalCompleted / totalCards) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressBarText}>
            {totalCompleted}/{totalCards} cards mastered
          </Text>
        </View>
      </View>

      <Animated.View style={[styles.cardContainer, cardAnimatedStyle]}>
        {currentCard && <FlashCard card={currentCard} reviewMode={true} />}
      </Animated.View>

      <View style={styles.buttonsContainer}>
        <Pressable
          style={[styles.button, styles.againButton]}
          onPress={() => currentCard && handleCardReviewed(currentCard.id, false)}
        >
          <Text style={styles.buttonText}>Again</Text>
          <Text style={styles.buttonSubtext}>Incorrect</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.easyButton]}
          onPress={() => currentCard && handleCardReviewed(currentCard.id, true)}
        >
          <Text style={styles.buttonText}>Easy</Text>
          <Text style={styles.buttonSubtext}>Correct</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progress: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  reviewCount: {
    fontSize: 14,
    color: '#777',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  progressBarContainer: {
    marginTop: 5,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
    marginBottom: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#27ae60',
    borderRadius: 5,
  },
  progressBarText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  cardContainer: {
    flex: 1,
    marginBottom: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  againButton: {
    backgroundColor: '#e74c3c',
  },
  easyButton: {
    backgroundColor: '#27ae60',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonSubtext: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    marginBottom: 16,
  },
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  completeText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  statsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  reviewCycles: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  completionInfo: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    maxWidth: '100%',
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
}); 