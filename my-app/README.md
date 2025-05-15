# AnkiTranslator

A React Native flashcard app with built-in translator and dictionary functionality, similar to Anki.

## Features

- Create and manage decks of flashcards
- Add, edit, and delete cards within decks
- Flip cards to view front and back content
- Built-in translation using LibreTranslate API
- Dictionary definitions using the Free Dictionary API
- Search functionality across all cards
- Review mode with card tracking

## Technologies Used

- React Native with Expo
- Redux Toolkit (RTK) for state management
- RTK Query for API integrations
- React Native Reanimated for smooth animations
- Redux Persist for local storage
- TypeScript for type safety

## APIs Used

- [LibreTranslate API](https://libretranslate.com/) - Open source machine translation
- [Free Dictionary API](https://dictionaryapi.dev/) - Free dictionary definitions

## Getting Started

### Prerequisites

- Node.js
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd AnkiTranslator
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Run on device or emulator:
   ```
   npm run android
   ```

## Usage

### Creating Decks and Cards

1. On the home screen, tap "Add New Deck"
2. Enter a name and description for your deck
3. Inside a deck, tap "Add Card" to create a new flashcard
4. Enter content for the front and back of the card
5. Use the "Translate" button to automatically translate text between languages
6. Use the "Define" button to fetch a dictionary definition for a word

### Reviewing Cards

1. Open a deck and tap "Start Review"
2. Cards will be presented one by one
3. Tap on a card to flip it and see the answer
4. Select "Again" or "Easy" to move to the next card
5. Review session will track progress

### Searching Cards

1. Go to the Search tab
2. Enter a search term to find cards across all decks
3. Tap on a result to navigate to the corresponding deck

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
