import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import FlashCard from '../../src/components/FlashCard';
import { RootState } from '../../src/store';
import { Card, Deck } from '../../src/types';

type SearchResult = {
  card: Card;
  deck: Deck;
};

export default function ExploreScreen() {
  const { decks } = useSelector((state: RootState) => state.decks);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setResults([]);
      return;
    }

    const searchResults: SearchResult[] = [];
    const lowerCaseSearch = searchTerm.toLowerCase();

    decks.forEach((deck: Deck) => {
      deck.cards.forEach((card: Card) => {
        if (
          card.front.toLowerCase().includes(lowerCaseSearch) ||
          card.back.toLowerCase().includes(lowerCaseSearch)
        ) {
          searchResults.push({ card, deck });
        }
      });
    });

    setResults(searchResults);
  }, [searchTerm, decks]);

  const handleCardPress = (deckId: string, cardId: string) => {
    router.push(`/deck/${deckId}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={24} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search cards..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          autoCapitalize="none"
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity onPress={() => setSearchTerm('')}>
            <Ionicons name="close-circle" size={24} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {searchTerm.trim() === '' ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Enter a search term to find cards across all decks
          </Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No cards found matching "{searchTerm}"</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.deck.id}-${item.card.id}`}
          renderItem={({ item }) => (
            <View style={styles.resultItem}>
              <Text style={styles.resultDeckName}>
                From deck: {item.deck.name}
              </Text>
              <TouchableOpacity
                onPress={() => handleCardPress(item.deck.id, item.card.id)}
              >
                <FlashCard card={item.card} reviewMode={true} />
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.resultsList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
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
    color: '#666',
  },
  resultsList: {
    paddingBottom: 20,
  },
  resultItem: {
    marginBottom: 20,
  },
  resultDeckName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 5,
  },
});
