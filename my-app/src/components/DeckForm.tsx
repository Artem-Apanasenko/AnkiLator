import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Deck } from '../types';

interface DeckFormProps {
  initialValues?: Partial<Deck>;
  onSubmit: (values: { name: string; description: string }) => void;
  onCancel: () => void;
}

const DeckForm: React.FC<DeckFormProps> = ({
  initialValues = { name: '', description: '' },
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState(initialValues.name || '');
  const [description, setDescription] = useState(initialValues.description || '');

  const handleSubmit = () => {
    if (!name.trim()) {
      // Show validation error
      return;
    }
    onSubmit({ name, description });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {initialValues.id ? 'Edit Deck' : 'Create New Deck'}
      </Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Deck Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter deck name"
          placeholderTextColor="#777777"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter deck description"
          placeholderTextColor="#777777"
          multiline
        />
      </View>

      <View style={styles.buttonRow}>
        <Pressable style={[styles.button, styles.cancelButton]} onPress={onCancel}>
          <Text style={styles.buttonText}>Cancel</Text>
        </Pressable>
        <Pressable
          style={[
            styles.button,
            styles.submitButton,
            !name.trim() && styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={!name.trim()}
        >
          <Text style={styles.buttonText}>Save</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#333333',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
    color: '#DDDDDD',
  },
  input: {
    borderWidth: 1,
    borderColor: '#444444',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#2A2A2A',
    color: '#FFFFFF',
  },
  textArea: {
    minHeight: 100,
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
  cancelButton: {
    backgroundColor: '#444444',
  },
  submitButton: {
    backgroundColor: '#3C863D',
  },
  disabledButton: {
    backgroundColor: '#333333',
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default DeckForm; 