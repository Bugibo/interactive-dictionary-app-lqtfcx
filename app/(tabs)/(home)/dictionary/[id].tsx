
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
import DraggableWordRow from '@/components/DraggableWordRow';
import WordSelectionModal from '@/components/WordSelectionModal';
import { useIsOnline } from '@/utils/translation';
import * as Haptics from 'expo-haptics';

export default function DictionaryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getDictionary, updateDictionary } = useDictionary();
  const dictionary = getDictionary(id);
  const isOnline = useIsOnline();
  
  const [words, setWords] = useState<Word[]>(dictionary?.words || []);
  const [selectionModalVisible, setSelectionModalVisible] = useState(false);

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

  const handleReorderWords = (newWords: Word[]) => {
    setWords(newWords);
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

  const handleStartTest = (selectedWordIds: string[]) => {
    if (selectedWordIds.length === 0) {
      Alert.alert('No Words Selected', 'Please select at least one word to test.');
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectionModalVisible(false);
    router.push({
      pathname: '/(tabs)/(home)/test',
      params: { dictionaryId: id, wordIds: selectedWordIds.join(',') },
    });
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
              <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
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
          {words.map((word, index) => (
            <DraggableWordRow
              key={word.id}
              word={word}
              index={index}
              onUpdate={handleUpdateWord}
              onDelete={() => handleDeleteWord(word.id)}
              onReorder={handleReorderWords}
              allWords={words}
              isOnline={isOnline}
            />
          ))}
          
          <TouchableOpacity style={styles.addButton} onPress={handleAddWord}>
            <IconSymbol name="plus.circle.fill" size={32} color={colors.primary} />
            <Text style={styles.addButtonText}>Add Word</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.runButton}
            onPress={() => setSelectionModalVisible(true)}
          >
            <IconSymbol name="play.fill" size={24} color="#FFFFFF" />
            <Text style={styles.runButtonText}>Run Test</Text>
          </TouchableOpacity>
        </View>
      </View>

      <WordSelectionModal
        visible={selectionModalVisible}
        words={words}
        onClose={() => setSelectionModalVisible(false)}
        onStartTest={handleStartTest}
      />
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
    paddingBottom: 120,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  addButtonText: {
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
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    boxShadow: '0px -2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 8,
  },
  runButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
    gap: 8,
  },
  runButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
