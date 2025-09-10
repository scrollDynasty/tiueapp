import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useResponsive } from '@/hooks/useResponsive';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';

interface TabItem {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface ScrollableTabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabPress: (tabKey: string) => void;
}

export const ScrollableTabBar: React.FC<ScrollableTabBarProps> = ({
  tabs,
  activeTab,
  onTabPress,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isSmallScreen, spacing } = useResponsive();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={[styles.contentContainer, { paddingHorizontal: spacing.md }]}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              { 
                backgroundColor: activeTab === tab.key ? colors.primary : 'transparent',
                marginHorizontal: spacing.xs / 2,
              }
            ]}
            onPress={() => onTabPress(tab.key)}
          >
            <Ionicons 
              name={tab.icon}
              size={isSmallScreen ? 20 : 24}
              color={activeTab === tab.key ? colors.background : colors.primary}
            />
            <ThemedText 
              style={[
                styles.tabText,
                { 
                  color: activeTab === tab.key ? colors.background : colors.primary,
                  fontSize: isSmallScreen ? 12 : 14,
                  marginTop: spacing.xs / 2,
                }
              ]}
            >
              {tab.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  scrollView: {
    maxHeight: 80,
  },
  contentContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 70,
  },
  tabText: {
    textAlign: 'center',
  },
});
