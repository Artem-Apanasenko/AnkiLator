import { ExpoRoot } from 'expo-router';
import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './src/store';

export default function App() {
  const ctx = require.context('./app');
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ExpoRoot context={ctx} />
      </PersistGate>
    </Provider>
  );
} 