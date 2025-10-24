
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated as RNAnimated,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useDictionary } from '@/contexts/DictionaryContext';
import { TestWord, Word } from '@/types/dictionary';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export default function TestScreen() {
  const { dictionaryId, wordIds } = useLocalSearchParams<{ dictionaryId: string; wordIds: string }>();
  const router = useRouter();
  const { getDictionary } = useDictionary();
  const dictionary = getDictionary(dictionaryId);
  
  const [testWords, setTestWords] = useState<TestWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  const shakeAnimation = useRef(new RNAnimated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (dictionary && wordIds) {
      const ids = wordIds.split(',');
      const selectedWords = dictionary.words.filter(w => ids.includes(w.id));
      
      // Randomize question direction for each word
      const testWordsList: TestWord[] = selectedWords.map(w => ({
        ...w,
        questionDirection: Math.random() > 0.5 ? 'en-ru' : 'ru-en',
      }));
      
      setTestWords(testWordsList);
    }
  }, [dictionary, wordIds]);

  const currentWord = testWords[currentIndex];

  const shake = () => {
    RNAnimated.sequence([
      RNAnimated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      RNAnimated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      RNAnimated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      RNAnimated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const checkAnswer = () => {
    if (!currentWord || !answer.trim()) {
      return;
    }

    const correctAnswer = currentWord.questionDirection === 'en-ru'
      ? currentWord.translation
      : currentWord.word;

    const isAnswerCorrect = answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

    if (isAnswerCorrect) {
      // Correct answer
      setIsCorrect(true);
      setShowSuccess(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      setTimeout(() => {
        setShowSuccess(false);
        setIsCorrect(false);
        setAnswer('');
        
        if (currentIndex < testWords.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          // Test completed
          Alert.alert(
            'Test Completed!',
            'Congratulations! You have completed all words.',
            [{ text: 'OK', onPress: () => router.back() }]
          );
        }
      }, 800);
    } else {
      // Incorrect answer
      shake();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setAnswer('');
      inputRef.current?.focus();
    }
  };

  const handleExit = () => {
    Alert.alert(
      'Exit Test?',
      'Are you sure you want to exit? Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', style: 'destructive', onPress: () => router.back() },
      ]
    );
  };

  if (!currentWord) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No words to test</Text>
      </View>
    );
  }

  const question = currentWord.questionDirection === 'en-ru'
    ? currentWord.word
    : currentWord.translation;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Test Mode',
          headerLeft: () => (
            <TouchableOpacity onPress={handleExit} style={styles.headerButton}>
              <IconSymbol name="xmark" size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <View style={styles.container}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {testWords.length}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentIndex + 1) / testWords.length) * 100}%` },
              ]}
            />
          </View>
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.directionText}>
            {currentWord.questionDirection === 'en-ru' ? 'English → Russian' : 'Russian → English'}
          </Text>
          <Text style={styles.questionText}>{question}</Text>
          {currentWord.transcription && (
            <Text style={styles.transcriptionText}>[{currentWord.transcription}]</Text>
          )}
        </View>

        <RNAnimated.View
          style={[
            styles.inputContainer,
            { transform: [{ translateX: shakeAnimation }] },
          ]}
        >
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Type your answer"
            placeholderTextColor={colors.textSecondary}
            value={answer}
            onChangeText={setAnswer}
            onSubmitEditing={checkAnswer}
            autoFocus
            autoCorrect={false}
            autoComplete="off"
            spellCheck={false}
            autoCapitalize="none"
          />
        </RNAnimated.View>

        <TouchableOpacity
          style={[styles.submitButton, !answer.trim() && styles.disabledButton]}
          onPress={checkAnswer}
          disabled={!answer.trim()}
        >
          <Text style={styles.submitButtonText}>Check Answer</Text>
        </TouchableOpacity>

        {showSuccess && (
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            style={styles.successOverlay}
          >
            <View style={styles.successCircle}>
              <IconSymbol name="checkmark" size={64} color="#FFFFFF" />
            </View>
          </Animated.View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  questionContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    alignItems: 'center',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  directionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 16,
  },
  questionText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  transcriptionText: {
    fontSize: 18,
    fontStyle: 'italic',
    color: colors.textSecondary,
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: colors.text,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.5,
  },
  errorText: {
    fontSize: 18,
    color: colors.error,
    textAlign: 'center',
    marginTop: 32,
  },
  headerButton: {
    padding: 8,
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
