
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dictionary, Word } from '@/types/dictionary';

interface DictionaryContextType {
  dictionaries: Dictionary[];
  addDictionary: (name: string) => Promise<void>;
  deleteDictionary: (id: string) => Promise<void>;
  updateDictionary: (id: string, words: Word[]) => Promise<void>;
  getDictionary: (id: string) => Dictionary | undefined;
  loading: boolean;
}

const DictionaryContext = createContext<DictionaryContextType | undefined>(undefined);

const STORAGE_KEY = '@dictionaries';

export function DictionaryProvider({ children }: { children: ReactNode }) {
  const [dictionaries, setDictionaries] = useState<Dictionary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDictionaries();
  }, []);

  const loadDictionaries = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const dicts = parsed.map((d: any) => ({
          ...d,
          lastUpdated: new Date(d.lastUpdated),
        }));
        setDictionaries(dicts);
      }
    } catch (error) {
      console.log('Error loading dictionaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveDictionaries = async (dicts: Dictionary[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dicts));
    } catch (error) {
      console.log('Error saving dictionaries:', error);
    }
  };

  const addDictionary = async (name: string) => {
    const newDict: Dictionary = {
      id: Date.now().toString(),
      name,
      lastUpdated: new Date(),
      words: [],
    };
    const updated = [...dictionaries, newDict];
    setDictionaries(updated);
    await saveDictionaries(updated);
  };

  const deleteDictionary = async (id: string) => {
    const updated = dictionaries.filter(d => d.id !== id);
    setDictionaries(updated);
    await saveDictionaries(updated);
  };

  const updateDictionary = async (id: string, words: Word[]) => {
    const updated = dictionaries.map(d => {
      if (d.id === id) {
        // Check if dictionary should be auto-deleted (no words or only dots)
        const hasValidWords = words.some(w => w.word.trim() !== '' && w.word.trim() !== '.');
        if (!hasValidWords && words.length === 0) {
          return null; // Mark for deletion
        }
        return {
          ...d,
          words,
          lastUpdated: new Date(),
        };
      }
      return d;
    }).filter(Boolean) as Dictionary[];
    
    setDictionaries(updated);
    await saveDictionaries(updated);
  };

  const getDictionary = (id: string) => {
    return dictionaries.find(d => d.id === id);
  };

  return (
    <DictionaryContext.Provider
      value={{
        dictionaries,
        addDictionary,
        deleteDictionary,
        updateDictionary,
        getDictionary,
        loading,
      }}
    >
      {children}
    </DictionaryContext.Provider>
  );
}

export function useDictionary() {
  const context = useContext(DictionaryContext);
  if (!context) {
    throw new Error('useDictionary must be used within DictionaryProvider');
  }
  return context;
}
