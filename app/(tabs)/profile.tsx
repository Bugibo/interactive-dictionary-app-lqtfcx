
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { useDictionary } from '@/contexts/DictionaryContext';

export default function ProfileScreen() {
  const { dictionaries } = useDictionary();
  
  const totalWords = dictionaries.reduce((sum, dict) => sum + dict.words.length, 0);
  const totalDictionaries = dictionaries.length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <IconSymbol name="person.fill" size={48} color={colors.primary} />
          </View>
          <Text style={styles.title}>Your Progress</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <IconSymbol name="book.fill" size={32} color={colors.primary} />
            <Text style={styles.statNumber}>{totalDictionaries}</Text>
            <Text style={styles.statLabel}>Dictionaries</Text>
          </View>

          <View style={styles.statCard}>
            <IconSymbol name="text.book.closed.fill" size={32} color={colors.accent} />
            <Text style={styles.statNumber}>{totalWords}</Text>
            <Text style={styles.statLabel}>Total Words</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>About This App</Text>
          <Text style={styles.infoText}>
            Interactive Dictionary helps you learn new vocabulary through organized dictionaries and interactive tests.
          </Text>
          <Text style={styles.infoText}>
            Features:
          </Text>
          <Text style={styles.infoText}>
            - Create multiple dictionaries
          </Text>
          <Text style={styles.infoText}>
            - Add words with translations
          </Text>
          <Text style={styles.infoText}>
            - Auto-translate using LibreTranslate API
          </Text>
          <Text style={styles.infoText}>
            - Text-to-speech pronunciation
          </Text>
          <Text style={styles.infoText}>
            - Interactive testing mode
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 8,
  },
});
