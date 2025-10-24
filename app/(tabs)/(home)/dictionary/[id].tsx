
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useDictionary } from '@/contexts/DictionaryContext';
import { Word } from '@/types/dictionary';
import WordRow from '@/components/WordRow';
import { useIsOnline } from '@/utils/translation';
import * as Haptics from 'expo-haptics';

export default function DictionaryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getDictionary, updateDictionary } = useDictionary();
  const dictionary = getDictionary(id);
  const isOnline = useIsOnline();
  
  const [words, setWords] = useState<Word[]>(dictionary?.words || []);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (dictionary) {
      setWords(dictionary.words);
    }
  }, [dictionary]);

  const handleAddWord = () => {
    const newWord: Word = {
      id: Date.now().toString(),
      word: '',
      transcription: '',
      translation: '',
      isAutoFilled: false,
      language: 'en',
    };
    setWords([...words, newWord]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleUpdateWord = (updatedWord: Word) => {
    setWords(words.map(w => w.id === updatedWord.id ? updatedWord : w));
  };

  const handleDeleteWord = (wordId: string) => {
    setWords(words.filter(w => w.id !== wordId));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSave = async () => {
    // Filter out empty words (only dots or empty)
    const validWords = words.filter(w => w.word.trim() !== '' && w.word.trim() !== '.');
    await updateDictionary(id, validWords);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const handleBack = () => {
    // Clear auto-filled flags but keep manual input
    const clearedWords = words.map(w => ({
      ...w,
      translation: w.isAutoFilled ? '' : w.translation,
      transcription: w.isAutoFilled ? '' : w.transcription,
      isAutoFilled: false,
    }));
    setWords(clearedWords);
    updateDictionary(id, clearedWords);
    router.back();
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      setSelectedWords(new Set());
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSelectAll = () => {
    const validWords = words.filter(w => w.word.trim() !== '');
    setSelectedWords(new Set(validWords.map(w => w.id)));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleStartTest = () => {
    if (selectedWords.size === 0) {
      Alert.alert('No Words Selected', 'Please select at least one word to test.');
      return;
    }
    
    const selectedWordsList = words.filter(w => selectedWords.has(w.id));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/(tabs)/(home)/test',
      params: { dictionaryId: id, wordIds: Array.from(selectedWords).join(',') },
    });
  };

  const toggleWordSelection = (wordId: string) => {
    const newSelection = new Set(selectedWords);
    if (newSelection.has(wordId)) {
      newSelection.delete(wordId);
    } else {
      newSelection.add(wordId);
    }
    setSelectedWords(newSelection);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (!dictionary) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Dictionary not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: dictionary.name,
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
              <IconSymbol name="chevron.left" size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerRightContainer}>
              {!selectionMode && (
                <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
                  <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
              )}
            </View>
          ),
        }}
      />
      
      <View style={styles.container}>
        {!isOnline && (
          <View style={styles.offlineBanner}>
            <IconSymbol name="wifi.slash" size={16} color="#FFFFFF" />
            <Text style={styles.offlineText}>Offline - Translation unavailable</Text>
          </View>
        )}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        >
          {words.map((word) => (
            <WordRow
              key={word.id}
              word={word}
              onUpdate={handleUpdateWord}
              onDelete={() => handleDeleteWord(word.id)}
              isOnline={isOnline}
              selectionMode={selectionMode}
              isSelected={selectedWords.has(word.id)}
              onSelect={() => toggleWordSelection(word.id)}
            />
          ))}
        </ScrollView>

        <View style={styles.bottomBar}>
          {selectionMode ? (
            <>
              <TouchableOpacity style={styles.bottomButton} onPress={handleSelectAll}>
                <IconSymbol name="checkmark.circle.fill" size={24} color={colors.primary} />
                <Text style={styles.bottomButtonText}>Select All</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.bottomButton} onPress={toggleSelectionMode}>
                <IconSymbol name="xmark.circle.fill" size={24} color={colors.error} />
                <Text style={styles.bottomButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.bottomButton, styles.startTestButton]}
                onPress={handleStartTest}
              >
                <IconSymbol name="play.fill" size={24} color="#FFFFFF" />
                <Text style={styles.startTestButtonText}>Start Test</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.bottomButton} onPress={handleAddWord}>
                <IconSymbol name="plus.circle.fill" size={24} color={colors.primary} />
                <Text style={styles.bottomButtonText}>Add Word</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.bottomButton} onPress={toggleSelectionMode}>
                <IconSymbol name="checkmark.circle.fill" size={24} color={colors.accent} />
                <Text style={styles.bottomButtonText}>Test Mode</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  errorText: {
    fontSize: 18,
    color: colors.error,
    textAlign: 'center',
    marginTop: 32,
  },
  offlineBanner: {
    backgroundColor: colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    gap: 8,
  },
  offlineText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  headerButton: {
    padding: 8,
  },
  headerRightContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  saveText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    boxShadow: '0px -2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 8,
  },
  bottomButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.background,
    gap: 6,
  },
  bottomButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  startTestButton: {
    backgroundColor: colors.primary,
  },
  startTestButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
