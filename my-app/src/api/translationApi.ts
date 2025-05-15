import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { useState } from 'react';

interface TranslateTextParams {
  text: string;
  from: string;
  to: string;
}

interface TranslateTextResponse {
  translatedText: string;
}

interface LanguageResponse {
  code: string;
  name: string;
}

// List of supported languages for translation
const supportedLanguages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'nl', name: 'Dutch' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'ko', name: 'Korean' },
  { code: 'cs', name: 'Czech' },
  { code: 'da', name: 'Danish' },
  { code: 'fi', name: 'Finnish' },
  { code: 'el', name: 'Greek' },
  { code: 'hi', name: 'Hindi' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'id', name: 'Indonesian' },
  { code: 'pl', name: 'Polish' },
  { code: 'sv', name: 'Swedish' },
  { code: 'tr', name: 'Turkish' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'vi', name: 'Vietnamese' },
];

// Basic API for compatibility - we'll actually use fetch directly
export const translationApi = createApi({
  reducerPath: 'translationApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/',
  }),
  endpoints: (builder) => ({
    // Empty endpoints - we'll handle the actual API calls in our custom hooks
    translateText: builder.mutation<TranslateTextResponse, TranslateTextParams>({
      query: () => ({ url: '' })
    }),
    getSupportedLanguages: builder.query<LanguageResponse[], void>({
      query: () => ''
    }),
  }),
});

// Custom useTranslateTextMutation hook that matches RTK Query's interface
export const useTranslateTextMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const translateText = async (params: TranslateTextParams) => {
    setIsLoading(true);
    
    // Make the object match what RTK Query returns
    const result = {
      unwrap: async () => {
        try {
          const langPair = `${params.from}|${params.to}`;
          const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(params.text)}&langpair=${encodeURIComponent(langPair)}`;
          
          const response = await fetch(url);
          const data = await response.json();
          
          if (data.responseData && data.responseData.translatedText) {
            return { translatedText: data.responseData.translatedText };
          }
          throw new Error('Translation failed');
        } catch (error) {
          console.error('Translation error:', error);
          throw error;
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    return result;
  };
  
  return [translateText, { isLoading }];
};

// Custom hook to provide the language list
export const useGetSupportedLanguagesQuery = () => {
  return {
    data: supportedLanguages,
    isLoading: false,
    isSuccess: true,
    error: null
  };
};
