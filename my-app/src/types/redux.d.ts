import { PayloadAction } from '@reduxjs/toolkit';
import { Deck } from './index';

// Define types for the Redux state
declare module '@reduxjs/toolkit' {
  export interface SerializedError {
    name?: string;
    message?: string;
    stack?: string;
    code?: string;
  }

  // Fix the implicit any types in reducers
  export interface ActionReducerMapBuilder<State> {
    addCase<PT extends PayloadAction<any>>(
      actionCreator: ActionCreatorWithPayload<PT['payload']>,
      reducer: (state: State, action: PT) => State | void
    ): ActionReducerMapBuilder<State>;
    addCase<A extends Action>(
      actionType: string,
      reducer: (state: State, action: A) => State | void
    ): ActionReducerMapBuilder<State>;
  }
}

// Extend the state type
export interface DeckState {
  decks: Deck[];
  currentDeckId: string | null;
}

// Define specific action payload types
export interface AddDeckPayload {
  name: string;
  description: string;
}

export interface EditDeckPayload {
  id: string;
  name: string;
  description: string;
}

export interface AddCardPayload {
  deckId: string;
  front: string;
  back: string;
}

export interface EditCardPayload {
  deckId: string;
  cardId: string;
  front: string;
  back: string;
}

export interface DeleteCardPayload {
  deckId: string;
  cardId: string;
}

export interface UpdateLastReviewedPayload {
  deckId: string;
  cardId?: string;
} 