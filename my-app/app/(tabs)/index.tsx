import { router } from 'expo-router';
import React, { useState } from 'react';
import { Button, FlatList, Modal, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import DeckForm from '../../src/components/DeckForm';
import DeckItem from '../../src/components/DeckItem';
import { RootState } from '../../src/store';
import { addDeck, deleteDeck, editDeck, setCurrentDeck } from '../../src/store/deckSlice';
import { Deck } from '../../src/types';

export default function IndexScreen() {
  const dispatch = useDispatch();
  const { decks } = useSelector((state: RootState) => state.decks);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentDeck, setCurrentDeckState] = useState<Partial<Deck> | null>(null);

  const handleAddDeck = () => {
    setCurrentDeckState(null);
    setIsModalVisible(true);
  };

  const handleEditDeck = (deck: Deck) => {
    setCurrentDeckState(deck);
    setIsModalVisible(true);
  };

  const handleDeleteDeck = (deckId: string) => {
    dispatch(deleteDeck(deckId));
  };

  const handleSaveDeck = (values: { name: string; description: string }) => {
    if (currentDeck?.id) {
      dispatch(editDeck({ id: currentDeck.id, ...values }));
    } else {
      dispatch(addDeck(values));
    }
    setIsModalVisible(false);
  };

  const handleDeckPress = (deck: Deck) => {
    dispatch(setCurrentDeck(deck.id));
    router.push(`/deck/${deck.id}`);
  };

  return (
    <View style={styles.container}>
      {decks.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No decks yet. Create your first deck!</Text>
          <Button title="Create Deck" onPress={handleAddDeck} />
        </View>
      ) : (
        <FlatList
          data={decks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <DeckItem
              deck={item}
              onPress={() => handleDeckPress(item)}
              onEdit={() => handleEditDeck(item)}
              onDelete={() => handleDeleteDeck(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
      
      <View style={styles.buttonContainer}>
      <Button title="Add New Deck" onPress={handleAddDeck} />
      </View>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <DeckForm
              initialValues={currentDeck || {}}
              onSubmit={handleSaveDeck}
              onCancel={() => setIsModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#121212',
  },
  listContent: {
    paddingBottom: 20,
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
    color: '#BBBBBB',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#333333',
  },
});
