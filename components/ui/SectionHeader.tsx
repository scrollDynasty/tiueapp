import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LAYOUT, SPACING, TYPOGRAPHY } from '@/styles/global';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface SectionHeaderProps {
  title: string;
  actionText?: string;
  onActionPress?: () => void;
}

export function SectionHeader({ title, actionText, onActionPress }: SectionHeaderProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>
        {title}
      </Text>
      
      {actionText && onActionPress && (
        <Pressable 
          onPress={onActionPress}
          style={({ pressed }) => [
            styles.actionButton,
            { opacity: pressed ? 0.7 : 1 }
          ]}
        >
          <Text style={[styles.actionText, { color: colors.primary }]}>
            {actionText}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...LAYOUT.row,
    ...LAYOUT.spaceBetween,
    ...LAYOUT.alignCenter,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.containerHorizontal,
  },
  
  title: {
    ...TYPOGRAPHY.h3,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  
  actionButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  
  actionText: {
    ...TYPOGRAPHY.body2,
    fontWeight: '600',
  },
});
