
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { Dictionary } from '@/types/dictionary';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { Swipeable } from 'react-native-gesture-handler';

interface DictionaryItemProps {
  dictionary: Dictionary;
  onPress: () => void;
  onDelete: () => void;
}

export default function DictionaryItem({ dictionary, onPress, onDelete }: DictionaryItemProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderRightActions = () => (
    <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
      <IconSymbol name="trash" size={24} color="#FFFFFF" />
    </TouchableOpacity>
  );

  return (
    <Animated.View entering={FadeInRight} exiting={FadeOutLeft}>
      <Swipeable renderRightActions={renderRightActions}>
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
          <View style={styles.iconContainer}>
            <IconSymbol name="book.fill" size={28} color={colors.primary} />
          </View>
          <View style={styles.content}>
            <Text style={styles.name}>{dictionary.name}</Text>
            <Text style={styles.date}>
              {formatDate(dictionary.lastUpdated)} • {dictionary.words.length} words
            </Text>
          </View>
          <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </Swipeable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  deleteButton: {
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 12,
    marginBottom: 12,
  },
});
