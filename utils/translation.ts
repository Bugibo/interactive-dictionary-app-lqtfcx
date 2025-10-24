
import { useNetworkState } from 'expo-network';

export const detectLanguage = (text: string): 'en' | 'ru' => {
  // Check if text contains Cyrillic characters
  const cyrillicPattern = /[\u0400-\u04FF]/;
  return cyrillicPattern.test(text) ? 'ru' : 'en';
};

export const translateText = async (text: string, sourceLang: 'en' | 'ru', targetLang: 'en' | 'ru'): Promise<string> => {
  try {
    const response = await fetch('https://libretranslate.com/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        format: 'text',
      }),
    });

    if (!response.ok) {
      throw new Error('Translation failed');
    }

    const data = await response.json();
    return data.translatedText || text;
  } catch (error) {
    console.log('Translation error:', error);
    throw error;
  }
};

export const useIsOnline = () => {
  const networkState = useNetworkState();
  return networkState.isConnected === true && networkState.isInternetReachable === true;
};
