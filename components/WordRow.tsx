
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { Word } from '@/types/dictionary';
import * as Speech from 'expo-speech';
import { detectLanguage, translateText } from '@/utils/translation';
import * as Haptics from 'expo-haptics';

interface WordRowProps {
  word: Word;
  onUpdate: (word: Word) => void;
  onDelete: () => void;
  isOnline: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  selectionMode?: boolean;
}

export default function WordRow({
  word,
  onUpdate,
  onDelete,
  isOnline,
  isSelected,
  onSelect,
  selectionMode,
}: WordRowProps) {
  const [translating, setTranslating] = useState(false);

  const handleSpeak = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (word.word) {
      const lang = detectLanguage(word.word);
      await Speech.speak(word.word, {
        language: lang === 'ru' ? 'ru-RU' : 'en-US',
      });
    }
    
    if (word.translation) {
      setTimeout(async () => {
        const lang = detectLanguage(word.translation);
        await Speech.speak(word.translation, {
          language: lang === 'ru' ? 'ru-RU' : 'en-US',
        });
      }, 1000);
    }
  };

  const handleTranslate = async () => {
    if (!word.word.trim() || !isOnline) {
      return;
    }

    setTranslating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const sourceLang = detectLanguage(word.word);
      const targetLang = sourceLang === 'ru' ? 'en' : 'ru';
      const translation = await translateText(word.word, sourceLang, targetLang);
      
      onUpdate({
        ...word,
        translation,
        isAutoFilled: true,
        language: sourceLang,
      });
    } catch (error) {
      console.log('Translation failed:', error);
    } finally {
      setTranslating(false);
    }
  };

  return (
    <View style={[styles.container, isSelected && styles.selectedContainer]}>
      {selectionMode && (
        <TouchableOpacity onPress={onSelect} style={styles.checkbox}>
          <View style={[styles.checkboxInner, isSelected && styles.checkboxSelected]}>
            {isSelected && <IconSymbol name="checkmark" size={16} color="#FFFFFF" />}
          </View>
        </TouchableOpacity>
      )}
      
      <View style={styles.inputsContainer}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Word"
            placeholderTextColor={colors.textSecondary}
            value={word.word}
            onChangeText={(text) => onUpdate({ ...word, word: text })}
          />
          {word.isAutoFilled && (
            <View style={styles.apiTag}>
              <Text style={styles.apiTagText}>API</Text>
            </View>
          )}
        </View>
        
        <TextInput
          style={[styles.input, styles.transcriptionInput]}
          placeholder="Transcription"
          placeholderTextColor={colors.textSecondary}
          value={word.transcription}
          onChangeText={(text) => onUpdate({ ...word, transcription: text })}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Translation"
          placeholderTextColor={colors.textSecondary}
          value={word.translation}
          onChangeText={(text) => onUpdate({ ...word, translation: text, isAutoFilled: false })}
        />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleSpeak}
          disabled={!word.word && !word.translation}
        >
          <IconSymbol name="speaker.wave.2.fill" size={20} color={colors.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, (!isOnline || !word.word.trim()) && styles.disabledButton]}
          onPress={handleTranslate}
          disabled={!isOnline || !word.word.trim() || translating}
        >
          {translating ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <IconSymbol name="globe" size={20} color={isOnline ? colors.primary : colors.textSecondary} />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
          <IconSymbol name="trash" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  selectedContainer: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: colors.success,
  },
  checkbox: {
    marginRight: 12,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  inputsContainer: {
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    color: colors.text,
    marginBottom: 6,
  },
  transcriptionInput: {
    fontStyle: 'italic',
  },
  apiTag: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
    marginBottom: 6,
  },
  apiTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  actions: {
    marginLeft: 8,
    gap: 8,
  },
  actionButton: {
    padding: 6,
  },
  disabledButton: {
    opacity: 0.4,
  },
});
