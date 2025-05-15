import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Button, Dimensions, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useGetDefinitionQuery } from '../../src/api/dictionaryApi';
import { useGetSupportedLanguagesQuery } from '../../src/api/translationApi';
import FlashCard from '../../src/components/FlashCard';
import { RootState } from '../../src/store';
import { addCard, deleteCard, editCard } from '../../src/store/deckSlice';
import { Card, Deck } from '../../src/types';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default function DeckScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useDispatch();
  const decks = useSelector((state: RootState) => state.decks.decks);
  const deck = decks.find((d: Deck) => d.id === id);
  
  const [showForm, setShowForm] = useState(false);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [wordToDefine, setWordToDefine] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [fromLang, setFromLang] = useState('en');
  const [toLang, setToLang] = useState('es');
  const [showLanguages, setShowLanguages] = useState(false);
  
  // Language Selection
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  
  // Get available languages
  const { data: languages } = useGetSupportedLanguagesQuery();
  
  // Dictionary lookup
  const {
    data: definition,
    isLoading: isLoadingDefinition,
  } = useGetDefinitionQuery(
    { word: wordToDefine, language: 'en' },
    { skip: !wordToDefine }
  );

  // Handle translation
  const handleTranslate = async (direction: 'frontToBack' | 'backToFront') => {
    try {
      const textToTranslate = direction === 'frontToBack' ? front : back;
      
      if (!textToTranslate.trim()) {
        Alert.alert("Error", "Please enter text to translate.");
        return;
      }
      
      const from = direction === 'frontToBack' ? fromLang : toLang;
      const to = direction === 'frontToBack' ? toLang : fromLang;
      
      console.log('Translating:', textToTranslate, 'from', from, 'to', to);
      setIsTranslating(true);
      
      try {
        // Direct fetch to MyMemory API
        const langPair = `${from}|${to}`;
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=${encodeURIComponent(langPair)}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.responseData && data.responseData.translatedText) {
          if (direction === 'frontToBack') {
            setBack(data.responseData.translatedText);
          } else {
            setFront(data.responseData.translatedText);
          }
        } else {
          throw new Error('Translation failed');
        }
      } catch (error) {
        Alert.alert("Translation Error", "Could not translate text. Please try again later.");
      } finally {
        setIsTranslating(false);
      }
    } catch (error) {
      console.error('Translation error:', error);
      setIsTranslating(false);
    }
  };

  // Handle dictionary lookup
  const handleDefine = (text: string) => {
    if (!text.trim()) return;
    setWordToDefine(text.trim());
  };

  // Update back side with definition when available
  useEffect(() => {
    if (definition && definition.length > 0) {
      const firstDef = definition[0];
      if (firstDef.meanings && firstDef.meanings.length > 0) {
        const firstMeaning = firstDef.meanings[0];
        if (firstMeaning.definitions && firstMeaning.definitions.length > 0) {
          setBack(firstMeaning.definitions[0].definition);
        }
      }
    }
  }, [definition]);

  // Reset form state when closing form
  const resetForm = () => {
    setFront('');
    setBack('');
    setEditingCardId(null);
    setShowForm(false);
    setShowLanguages(false);
    setWordToDefine('');
  };

  if (!deck) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Deck not found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const handleAddCard = () => {
    setFront('');
    setBack('');
    setEditingCardId(null);
    setShowForm(true);
    console.log('Add card form opened');
  };

  const handleEditCard = (card: Card) => {
    setFront(card.front);
    setBack(card.back);
    setEditingCardId(card.id);
    setShowForm(true);
    console.log('Edit card form opened for card:', card.id);
  };

  const handleDeleteCard = (cardId: string) => {
    Alert.alert(
      "Delete Card",
      "Are you sure you want to delete this card?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => dispatch(deleteCard({ deckId: deck.id, cardId })) 
        }
      ]
    );
  };

  const handleSaveCard = () => {
    if (!front.trim() || !back.trim()) {
      Alert.alert("Error", "Both front and back text are required.");
      return;
    }
    
    if (editingCardId) {
      console.log('Saving edited card:', editingCardId);
      dispatch(
        editCard({
          deckId: deck.id,
          cardId: editingCardId,
          front,
          back,
        })
      );
    } else {
      console.log('Adding new card to deck:', deck.id);
      dispatch(
        addCard({
          deckId: deck.id,
          front,
          back,
        })
      );
    }
    
    resetForm();
  };

  const handleStartReview = () => {
    if (deck.cards.length === 0) {
      Alert.alert("No Cards", "There are no cards in this deck to review.");
      return;
    }
    router.push(`/review/${deck.id}`);
  };

  const filteredCards = useMemo(() => {
    if (!searchTerm) {
      return deck.cards;
    }
    return deck.cards.filter(card => 
      card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.back.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [deck.cards, searchTerm]);

  // Find language name by code
  const getLanguageName = (code: string) => {
    const language = languages?.find(lang => lang.code === code);
    return language ? language.name : code.toUpperCase();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{deck.name}</Text>
        <Text style={styles.description}>{deck.description}</Text>
        <Text style={styles.count}>{deck.cards.length} cards</Text>
      </View>

      {showForm ? (
        // Inline Card Form
        <View style={styles.formContainer}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>{editingCardId ? 'Edit Card' : 'Add New Card'}</Text>
            <TouchableOpacity onPress={resetForm} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {/* Language Selection */}
          <View style={styles.langSelectionContainer}>
            <View style={styles.langRow}>
              <View style={styles.langDropdownContainer}>
                <Text style={styles.langLabel}>From:</Text>
                <TouchableOpacity 
                  style={styles.langDropdown}
                  onPress={() => {
                    setShowFromDropdown(!showFromDropdown);
                    setShowToDropdown(false);
                  }}
                >
                  <Text style={styles.langDropdownText}>{getLanguageName(fromLang)}</Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>
                
                {/* From Language Dropdown */}
                {showFromDropdown && (
                  <View style={styles.dropdownList}>
                    <FlatList
                      data={languages}
                      keyExtractor={(item) => item.code}
                      renderItem={({ item }) => (
                        <TouchableOpacity 
                          style={[
                            styles.dropdownItem,
                            fromLang === item.code && styles.selectedDropdownItem
                          ]}
                          onPress={() => {
                            setFromLang(item.code);
                            setShowFromDropdown(false);
                          }}
                        >
                          <Text style={[
                            styles.dropdownItemText,
                            fromLang === item.code && styles.selectedDropdownItemText
                          ]}>
                            {item.name}
                          </Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                )}
              </View>
              
              <View style={styles.langDropdownContainer}>
                <Text style={styles.langLabel}>To:</Text>
                <TouchableOpacity 
                  style={styles.langDropdown}
                  onPress={() => {
                    setShowToDropdown(!showToDropdown);
                    setShowFromDropdown(false);
                  }}
                >
                  <Text style={styles.langDropdownText}>{getLanguageName(toLang)}</Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>
                
                {/* To Language Dropdown */}
                {showToDropdown && (
                  <View style={styles.dropdownList}>
                    <FlatList
                      data={languages}
                      keyExtractor={(item) => item.code}
                      renderItem={({ item }) => (
                        <TouchableOpacity 
                          style={[
                            styles.dropdownItem,
                            toLang === item.code && styles.selectedDropdownItem
                          ]}
                          onPress={() => {
                            setToLang(item.code);
                            setShowToDropdown(false);
                          }}
                        >
                          <Text style={[
                            styles.dropdownItemText,
                            toLang === item.code && styles.selectedDropdownItemText
                          ]}>
                            {item.name}
                          </Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                )}
              </View>
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Front</Text>
            <TextInput
              style={styles.input}
              value={front}
              onChangeText={setFront}
              placeholder="Enter front side text"
              multiline
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.translateButton]}
                onPress={() => handleTranslate('frontToBack')}
                disabled={isTranslating || !front.trim()}
              >
                {isTranslating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Translate</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.defineButton]}
                onPress={() => handleDefine(front)}
                disabled={isLoadingDefinition || !front.trim()}
              >
                {isLoadingDefinition ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Define</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Back</Text>
            <TextInput
              style={styles.input}
              value={back}
              onChangeText={setBack}
              placeholder="Enter back side text"
              multiline
            />
            <TouchableOpacity
              style={[styles.translateButton, {marginTop: 8}]}
              onPress={() => handleTranslate('backToFront')}
              disabled={isTranslating || !back.trim()}
            >
              {isTranslating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Translate Back to Front</Text>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={resetForm}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
                (!front.trim() || !back.trim()) && styles.disabledButton,
              ]}
              onPress={handleSaveCard}
              disabled={!front.trim() || !back.trim()}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // List of cards and search
        <>
          <View style={styles.searchAndActions}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search cards by front or back..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              clearButtonMode="always"
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddCard}>
              <Text style={styles.addButtonText}>Add Card</Text>
            </TouchableOpacity>
          </View>

          {filteredCards.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {searchTerm ? `No cards found matching "${searchTerm}"` : "No cards in this deck. Add your first card!"}
              </Text>
              {!searchTerm && <Button title="Add Card" onPress={handleAddCard} />}
            </View>
          ) : (
            <>
              <FlatList
                data={filteredCards}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <FlashCard
                    card={item}
                    onEdit={() => handleEditCard(item)}
                    onDelete={() => handleDeleteCard(item.id)}
                  />
                )}
                contentContainerStyle={styles.listContent}
              />
              <View style={styles.buttonContainer}>
                <Button title="Start Review" onPress={handleStartReview} />
              </View>
            </>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#121212',
  },
  header: {
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#FFFFFF',
  },
  description: {
    fontSize: 16,
    color: '#BBBBBB',
    marginBottom: 8,
  },
  count: {
    fontSize: 14,
    color: '#999999',
  },
  searchAndActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#444444',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
    backgroundColor: '#1E1E1E',
    color: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    marginBottom: 10,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    marginBottom: 16,
  },
  // Form styles
  formContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    fontWeight: '500',
    color: '#DDDDDD',
  },
  input: {
    borderWidth: 1,
    borderColor: '#444444',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    backgroundColor: '#2A2A2A',
    color: '#FFFFFF',
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  actionButton: {
    flex: 0.48,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  translateButton: {
    backgroundColor: '#4A69BD',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  defineButton: {
    backgroundColor: '#3C863D',
  },
  cancelButton: {
    backgroundColor: '#444444',
  },
  saveButton: {
    backgroundColor: '#3C863D',
  },
  disabledButton: {
    backgroundColor: '#333333',
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Language selection styles
  langSelectionContainer: {
    marginBottom: 15,
  },
  langRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  langDropdownContainer: {
    flex: 1,
    marginHorizontal: 5,
    marginBottom: 10,
    position: 'relative',
  },
  langLabel: {
    fontSize: 14,
    color: '#BBBBBB',
    marginBottom: 5,
  },
  langDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444444',
  },
  langDropdownText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#BBBBBB',
  },
  dropdownList: {
    position: 'absolute',
    top: 75,
    left: 0,
    right: 0,
    maxHeight: 200,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444444',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  selectedDropdownItem: {
    backgroundColor: '#3B82F6',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  selectedDropdownItemText: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
}); 