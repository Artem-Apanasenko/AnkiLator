import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface GetDefinitionParams {
  word: string;
  language?: string;
}

interface DictionaryResponse {
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

export const dictionaryApi = createApi({
  reducerPath: 'dictionaryApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://api.dictionaryapi.dev/api/v2/entries/' }),
  endpoints: (builder) => ({
    getDefinition: builder.query<DictionaryResponse[], GetDefinitionParams>({
      query: ({ word, language = 'en' }: GetDefinitionParams) => `${language}/${encodeURIComponent(word)}`,
    }),
  }),
});

export const { useGetDefinitionQuery } = dictionaryApi; 