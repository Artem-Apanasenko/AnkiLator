import React from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Deck } from '../types';

interface DeckItemProps {
  deck: Deck;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const DeckItem: React.FC<DeckItemProps> = ({
  deck,
  onPress,
  onEdit,
  onDelete,
}) => {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{deck.name}</Text>
        <Text style={styles.description}>{deck.description}</Text>
        <Text style={styles.stats}>
          {deck.cards.length} {deck.cards.length === 1 ? 'card' : 'cards'} • Last reviewed:{' '}
          {deck.lastReviewed
            ? new Date(deck.lastReviewed).toLocaleDateString()
            : 'Never'}
        </Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.iconButton} onPress={onEdit}>
          <Text style={styles.iconText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={onDelete}>
          <Text style={styles.iconText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#4a69bd',
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#333333',
  },
  infoContainer: {
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#FFFFFF',
  },
  description: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 5,
    opacity: 0.8,
  },
  stats: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
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

export default DeckItem; 