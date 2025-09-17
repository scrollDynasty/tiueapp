import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { hp, LAYOUT, SHADOWS, SIZES, SPACING, TYPOGRAPHY, wp } from '@/styles/global';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

interface QuickActionProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient?: [string, string];
  onPress?: () => void;
}

export function QuickAction({ title, icon, gradient, onPress }: QuickActionProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const ActionContent = () => (
    <View style={styles.content}>
      <View style={[styles.iconContainer, { backgroundColor: gradient ? 'rgba(255, 255, 255, 0.2)' : colors.backgroundSecondary }]}>
        <Ionicons 
          name={icon} 
          size={28} 
          color={gradient ? '#FFFFFF' : colors.primary} 
        />
      </View>
      <Text style={[styles.title, { color: gradient ? '#FFFFFF' : colors.text }]}>
        {title}
      </Text>
    </View>
  );

  const containerStyle = [
    styles.container,
    { backgroundColor: gradient ? 'transparent' : colors.card }
  ];

  if (gradient && Platform.OS !== 'android') {
    // На Android убираем градиенты - используем обычный вид
    return (
      <Pressable 
        onPress={onPress}
        style={({ pressed }) => [
          containerStyle,
          { opacity: pressed ? 0.8 : 1 }
        ]}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <ActionContent />
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable 
      onPress={onPress}
      style={({ pressed }) => [
        containerStyle,
        { opacity: pressed ? 0.8 : 1 }
      ]}
    >
      <ActionContent />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: SIZES.border.large,
    overflow: 'hidden',
    flex: 1,
    minHeight: hp(14),
    // Условные тени - только для iOS, на Android минимальные
    ...Platform.select({
      android: {
        elevation: 2, // Минимальная тень на Android
        shadowColor: 'transparent',
      },
      ios: SHADOWS.medium, // Красивые тени на iOS
      default: SHADOWS.medium,
    }),
  },
  
  gradient: {
    flex: 1,
    borderRadius: SIZES.border.large,
  },
  
  content: {
    flex: 1,
    ...LAYOUT.center,
    padding: SPACING.lg,
  },
  
  iconContainer: {
    width: wp(16),
    height: wp(16),
    borderRadius: wp(8),
    ...LAYOUT.center,
    marginBottom: SPACING.md,
  },
  
  title: {
    ...TYPOGRAPHY.h4,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
});
