
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { BlurView } from 'expo-blur';
import { colors } from '@/styles/commonStyles';

export interface TabBarItem {
  name: string;
  route: string;
  icon: string;
  label: string;
}

interface FloatingTabBarProps {
  tabs: TabBarItem[];
  containerWidth?: number;
  borderRadius?: number;
  bottomMargin?: number;
}

export default function FloatingTabBar({
  tabs,
  containerWidth = 200,
  borderRadius = 25,
  bottomMargin = 20,
}: FloatingTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleTabPress = (route: string) => {
    router.push(route as any);
  };

  const isActive = (route: string) => {
    return pathname.startsWith(route);
  };

  return (
    <View style={[styles.container, { bottom: bottomMargin }]}>
      <BlurView intensity={80} style={[styles.tabBar, { borderRadius }]}>
        {tabs.map((tab) => {
          const active = isActive(tab.route);
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tab}
              onPress={() => handleTabPress(tab.route)}
              activeOpacity={0.7}
            >
              <IconSymbol
                name={tab.icon as any}
                size={24}
                color={active ? colors.primary : colors.text}
              />
              <Text style={[styles.label, active && styles.activeLabel]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.8)' : colors.card,
    paddingVertical: 12,
    paddingHorizontal: 20,
    boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.1)',
    elevation: 8,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    color: colors.text,
  },
  activeLabel: {
    color: colors.primary,
    fontWeight: '600',
  },
});
