export interface Card {
  id: string;
  front: string;
  back: string;
  createdAt: number;
  lastReviewed?: number;
  reviewCount: number;
  nextReviewDate?: number;
}

export interface Deck {
  id: string;
  name: string;
  description: string;
  cards: Card[];
  createdAt: number;
  lastReviewed?: number;
}

export interface TranslationResponse {
  translatedText: string;
  from: string;
  to: string;
}

export interface DictionaryResponse {
  word: string;
  phonetics: Array<{
    text?: string;
    audio?: string;
  }>;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
      synonyms?: string[];
      antonyms?: string[];
    }>;
  }>;
} 