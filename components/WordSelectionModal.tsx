
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { Word } from '@/types/dictionary';
import * as Haptics from 'expo-haptics';

interface WordSelectionModalProps {
  visible: boolean;
  words: Word[];
  onClose: () => void;
  onStartTest: (selectedWordIds: string[]) => void;
}

export default function WordSelectionModal({
  visible,
  words,
  onClose,
  onStartTest,
}: WordSelectionModalProps) {
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());

  const validWords = words.filter(w => w.word.trim() !== '' && w.translation.trim() !== '');

  const toggleWord = (wordId: string) => {
    const newSelection = new Set(selectedWords);
    if (newSelection.has(wordId)) {
      newSelection.delete(wordId);
    } else {
      newSelection.add(wordId);
    }
    setSelectedWords(newSelection);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const selectAll = () => {
    setSelectedWords(new Set(validWords.map(w => w.id)));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const deselectAll = () => {
    setSelectedWords(new Set());
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleStartTest = () => {
    onStartTest(Array.from(selectedWords));
  };

  const handleClose = () => {
    setSelectedWords(new Set());
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <BlurView intensity={80} style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Words to Practice</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <IconSymbol name="xmark" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {validWords.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol name="exclamationmark.triangle" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>
                No words available for testing. Please add words with translations first.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.selectionButtons}>
                <TouchableOpacity style={styles.selectionButton} onPress={selectAll}>
                  <IconSymbol name="checkmark.circle.fill" size={20} color={colors.primary} />
                  <Text style={styles.selectionButtonText}>Select All</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.selectionButton} onPress={deselectAll}>
                  <IconSymbol name="xmark.circle.fill" size={20} color={colors.error} />
                  <Text style={styles.selectionButtonText}>Deselect All</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.wordsList} showsVerticalScrollIndicator={false}>
                {validWords.map((word) => (
                  <TouchableOpacity
                    key={word.id}
                    style={[
                      styles.wordItem,
                      selectedWords.has(word.id) && styles.wordItemSelected,
                    ]}
                    onPress={() => toggleWord(word.id)}
                  >
                    <View style={styles.wordContent}>
                      <Text style={styles.wordText}>{word.word}</Text>
                      <Text style={styles.translationText}>{word.translation}</Text>
                    </View>
                    <View
                      style={[
                        styles.checkbox,
                        selectedWords.has(word.id) && styles.checkboxSelected,
                      ]}
                    >
                      {selectedWords.has(word.id) && (
                        <IconSymbol name="checkmark" size={16} color="#FFFFFF" />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.footer}>
                <Text style={styles.selectedCount}>
                  {selectedWords.size} word{selectedWords.size !== 1 ? 's' : ''} selected
                </Text>
                <TouchableOpacity
                  style={[
                    styles.startButton,
                    selectedWords.size === 0 && styles.startButtonDisabled,
                  ]}
                  onPress={handleStartTest}
                  disabled={selectedWords.size === 0}
                >
                  <IconSymbol name="play.fill" size={20} color="#FFFFFF" />
                  <Text style={styles.startButtonText}>Start Test</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 20,
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.2)',
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  selectionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  selectionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: colors.card,
    borderRadius: 8,
    gap: 6,
  },
  selectionButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  wordsList: {
    maxHeight: 400,
  },
  wordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  wordItemSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: colors.success,
  },
  wordContent: {
    flex: 1,
  },
  wordText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  translationText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  checkboxSelected: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  footer: {
    marginTop: 16,
    gap: 12,
  },
  selectedCount: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: colors.primary,
    borderRadius: 12,
    gap: 8,
  },
  startButtonDisabled: {
    opacity: 0.5,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
});
