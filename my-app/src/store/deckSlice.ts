import { createSlice, nanoid } from '@reduxjs/toolkit';
import { Card, Deck } from '../types';
import {
  DeckState
} from '../types/redux';

const initialState: DeckState = {
  decks: [],
  currentDeckId: null,
};

// One week in milliseconds
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const deckSlice = createSlice({
  name: 'decks',
  initialState,
  reducers: {
    addDeck: (state, action) => {
      const newDeck: Deck = {
        id: nanoid(),
        name: action.payload.name,
        description: action.payload.description,
        cards: [],
        createdAt: Date.now(),
      };
      state.decks.push(newDeck);
      state.currentDeckId = newDeck.id;
    },
    editDeck: (state, action) => {
      const { id, name, description } = action.payload;
      const deckIndex = state.decks.findIndex((deck) => deck.id === id);
      if (deckIndex !== -1) {
        state.decks[deckIndex].name = name;
        state.decks[deckIndex].description = description;
      }
    },
    deleteDeck: (state, action) => {
      state.decks = state.decks.filter((deck) => deck.id !== action.payload);
      if (state.currentDeckId === action.payload) {
        state.currentDeckId = state.decks.length > 0 ? state.decks[0].id : null;
      }
    },
    setCurrentDeck: (state, action) => {
      state.currentDeckId = action.payload;
    },
    addCard: (state, action) => {
      const { deckId, front, back } = action.payload;
      const deckIndex = state.decks.findIndex((deck) => deck.id === deckId);
      if (deckIndex !== -1) {
        const newCard: Card = {
          id: nanoid(),
          front,
          back,
          createdAt: Date.now(),
          reviewCount: 0,  // Initialize review count to 0
        };
        state.decks[deckIndex].cards.push(newCard);
      }
    },
    editCard: (state, action) => {
      const { deckId, cardId, front, back } = action.payload;
      const deckIndex = state.decks.findIndex((deck) => deck.id === deckId);
      if (deckIndex !== -1) {
        const cardIndex = state.decks[deckIndex].cards.findIndex(
          (card) => card.id === cardId
        );
        if (cardIndex !== -1) {
          state.decks[deckIndex].cards[cardIndex].front = front;
          state.decks[deckIndex].cards[cardIndex].back = back;
        }
      }
    },
    deleteCard: (state, action) => {
      const { deckId, cardId } = action.payload;
      const deckIndex = state.decks.findIndex((deck) => deck.id === deckId);
      if (deckIndex !== -1) {
        state.decks[deckIndex].cards = state.decks[deckIndex].cards.filter(
          (card) => card.id !== cardId
        );
      }
    },
    updateLastReviewed: (state, action) => {
      const { deckId, cardId } = action.payload;
      const deckIndex = state.decks.findIndex((deck) => deck.id === deckId);
      
      if (deckIndex !== -1) {
        state.decks[deckIndex].lastReviewed = Date.now();
        
        if (cardId) {
          const cardIndex = state.decks[deckIndex].cards.findIndex(
            (card) => card.id === cardId
          );
          if (cardIndex !== -1) {
            state.decks[deckIndex].cards[cardIndex].lastReviewed = Date.now();
          }
        }
      }
    },
    // New action to update review count and handle spaced repetition
    updateCardReviewCount: (state, action) => {
      const { deckId, cardId, wasCorrect } = action.payload;
      const deckIndex = state.decks.findIndex((deck) => deck.id === deckId);
      
      if (deckIndex !== -1) {
        const cardIndex = state.decks[deckIndex].cards.findIndex(
          (card) => card.id === cardId
        );
        
        if (cardIndex !== -1) {
          const card = state.decks[deckIndex].cards[cardIndex];
          
          // Update last reviewed timestamp
          card.lastReviewed = Date.now();
          
          if (wasCorrect) {
            // Increment review count
            card.reviewCount = (card.reviewCount || 0) + 1;
            
            // If card has been reviewed correctly 10 times, set next review date to a week from now
            if (card.reviewCount >= 10) {
              card.nextReviewDate = Date.now() + ONE_WEEK_MS;
            }
          } else {
            // For incorrect guesses, reset review count to keep practicing
            card.reviewCount = 0;
            card.nextReviewDate = undefined;
          }
        }
      }
    },
    // Reset a card's next review date if it's time to review it again
    resetCardReviewDate: (state, action) => {
      const { deckId, cardId } = action.payload;
      const deckIndex = state.decks.findIndex((deck) => deck.id === deckId);
      
      if (deckIndex !== -1) {
        const cardIndex = state.decks[deckIndex].cards.findIndex(
          (card) => card.id === cardId
        );
        
        if (cardIndex !== -1) {
          const card = state.decks[deckIndex].cards[cardIndex];
          const now = Date.now();
          
          // If the next review date has passed, reset it
          if (card.nextReviewDate && now > card.nextReviewDate) {
            card.nextReviewDate = undefined;
            // Reset review count to start over
            card.reviewCount = 0;
          }
        }
      }
    },
  },
});

export const {
  addDeck,
  editDeck,
  deleteDeck,
  setCurrentDeck,
  addCard,
  editCard,
  deleteCard,
  updateLastReviewed,
  updateCardReviewCount,
  resetCardReviewDate,
} = deckSlice.actions;

export default deckSlice.reducer; 