
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  PanResponder,
  Animated,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { Word } from '@/types/dictionary';
import * as Speech from 'expo-speech';
import { detectLanguage, translateText } from '@/utils/translation';
import * as Haptics from 'expo-haptics';

interface DraggableWordRowProps {
  word: Word;
  index: number;
  onUpdate: (word: Word) => void;
  onDelete: () => void;
  onReorder: (newWords: Word[]) => void;
  allWords: Word[];
  isOnline: boolean;
}

export default function DraggableWordRow({
  word,
  index,
  onUpdate,
  onDelete,
  onReorder,
  allWords,
  isOnline,
}: DraggableWordRowProps) {
  const [translating, setTranslating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const pan = useRef(new Animated.ValueXY()).current;
  const dragStartY = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only start dragging if moved more than 5 pixels vertically
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: (_, gestureState) => {
        setIsDragging(true);
        dragStartY.current = gestureState.y0;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      },
      onPanResponderMove: Animated.event([null, { dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        setIsDragging(false);
        
        const movedDistance = gestureState.dy;
        const rowHeight = 180; // Approximate height of a word row
        const moveSteps = Math.round(movedDistance / rowHeight);
        
        if (moveSteps !== 0) {
          const newIndex = Math.max(0, Math.min(allWords.length - 1, index + moveSteps));
          
          if (newIndex !== index) {
            const newWords = [...allWords];
            const [movedWord] = newWords.splice(index, 1);
            newWords.splice(newIndex, 0, movedWord);
            onReorder(newWords);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }
        
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

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
    <Animated.View
      style={[
        styles.container,
        isDragging && styles.draggingContainer,
        {
          transform: [{ translateY: pan.y }],
        },
      ]}
    >
      <View style={styles.contentRow}>
        <TouchableOpacity
          style={styles.dragHandle}
          {...panResponder.panHandlers}
        >
          <IconSymbol name="line.3.horizontal" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        
        <View style={styles.inputsContainer}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Word (English or Russian)"
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  draggingContainer: {
    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)',
    elevation: 8,
    opacity: 0.9,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dragHandle: {
    padding: 8,
    marginRight: 8,
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
