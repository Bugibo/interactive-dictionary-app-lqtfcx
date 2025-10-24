
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useDictionary } from '@/contexts/DictionaryContext';
import DictionaryItem from '@/components/DictionaryItem';
import AddDictionaryModal from '@/components/AddDictionaryModal';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export default function DictionariesScreen() {
  const router = useRouter();
  const { dictionaries, addDictionary, deleteDictionary, loading } = useDictionary();
  const [modalVisible, setModalVisible] = useState(false);

  const handleAddDictionary = async (name: string) => {
    await addDictionary(name);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDeleteDictionary = async (id: string) => {
    await deleteDictionary(id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleOpenDictionary = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(tabs)/(home)/dictionary/${id}`);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Dictionaries',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={styles.headerButton}
            >
              <IconSymbol name="plus" size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <View style={styles.container}>
        {loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Loading...</Text>
          </View>
        ) : dictionaries.length === 0 ? (
          <Animated.View entering={FadeIn} style={styles.emptyContainer}>
            <IconSymbol name="book.fill" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No Dictionaries Yet</Text>
            <Text style={styles.emptyText}>
              Tap the + button to create your first dictionary
            </Text>
          </Animated.View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          >
            {dictionaries.map((dict) => (
              <DictionaryItem
                key={dict.id}
                dictionary={dict}
                onPress={() => handleOpenDictionary(dict.id)}
                onDelete={() => handleDeleteDictionary(dict.id)}
              />
            ))}
          </ScrollView>
        )}
      </View>

      <AddDictionaryModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={handleAddDictionary}
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
    paddingBottom: Platform.OS === 'ios' ? 16 : 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  headerButton: {
    padding: 8,
  },
});
