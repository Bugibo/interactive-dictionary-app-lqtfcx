
import { Stack } from 'expo-router';
import React from 'react';

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Dictionaries',
        }}
      />
      <Stack.Screen
        name="dictionary/[id]"
        options={{
          title: 'Dictionary',
        }}
      />
      <Stack.Screen
        name="test"
        options={{
          title: 'Test Mode',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
