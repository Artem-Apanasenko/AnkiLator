import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useGetDefinitionQuery } from '../api/dictionaryApi';
import { Card } from '../types';

interface CardFormProps {
  initialValues?: Partial<Card>;
  onSubmit: (values: { front: string; back: string }) => void;
  onCancel: () => void;
}

const CardForm: React.FC<CardFormProps> = ({
  initialValues = { front: '', back: '' },
  onSubmit,
  onCancel,
}) => {
  const [front, setFront] = useState(initialValues.front || '');
  const [back, setBack] = useState(initialValues.back || '');
  const [wordToDefine, setWordToDefine] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const {
    data: definition,
    isLoading: isLoadingDefinition,
  } = useGetDefinitionQuery(
    { word: wordToDefine, language: 'en' },
    { skip: !wordToDefine }
  );

  const handleTranslate = async () => {
    try {
      if (!front.trim()) return;
      
      console.log('Translating:', front);
      setIsTranslating(true);
      
      // Use MyMemory Translation API for simple English to Spanish translation
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(front)}&langpair=en|es`;
      
      try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.responseData && data.responseData.translatedText) {
          setBack(data.responseData.translatedText);
        } else {
          throw new Error('Translation failed');
        }
      } catch (fetchError) {
        Alert.alert("Translation Error", "Could not translate text. Please try again later.");
      } finally {
        setIsTranslating(false);
      }
    } catch (error) {
      console.error('Translation error:', error);
      setIsTranslating(false);
    }
  };

  const handleDefine = (text: string) => {
    if (!text.trim()) return;
    setWordToDefine(text.trim());
  };

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

  const handleSubmit = () => {
    console.log('Submit button pressed');
    
    if (!front.trim() || !back.trim()) {
      Alert.alert("Error", "Both front and back text are required.");
      return;
    }
    
    onSubmit({ front, back });
  };

  return (
    <View style={styles.container}>
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
            onPress={handleTranslate}
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
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]} 
          onPress={onCancel}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            styles.submitButton,
            (!front.trim() || !back.trim()) && styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={!front.trim() || !back.trim()}
        >
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    minHeight: 80,
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
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  actionButton: {
    flex: 0.48,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  translateButton: {
    backgroundColor: '#4a69bd',
  },
  defineButton: {
    backgroundColor: '#6ab04c',
  },
  cancelButton: {
    backgroundColor: '#c8d6e5',
  },
  submitButton: {
    backgroundColor: '#22a6b3',
  },
  disabledButton: {
    backgroundColor: '#b2bec3',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CardForm; 