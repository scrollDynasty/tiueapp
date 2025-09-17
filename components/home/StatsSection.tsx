import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsive } from '@/hooks/useResponsive';
import React from 'react';
import { View } from 'react-native';
import { StatWidget } from './StatWidget';

interface StatsData {
  courses: string;
  events: string;
  grade: string;
  gradeTitle: string;
}

interface StatsSectionProps {
  statsData: StatsData;
}

export const StatsSection = React.memo(({ statsData }: StatsSectionProps) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const { isSmall, spacing } = useResponsive();

  return (
    <View style={{
      flexDirection: 'row',
      marginBottom: isSmall ? 16 : 24,
      gap: isSmall ? 4 : 8,
      paddingHorizontal: isSmall ? 2 : 0,
      justifyContent: 'space-between',
      alignItems: 'stretch',
    }}>
      <StatWidget 
        icon="book-outline" 
        title="Курсы" 
        value={statsData.courses} 
        color={colors.primary} 
      />
      <StatWidget 
        icon="calendar-outline" 
        title="События" 
        value={statsData.events} 
        color={colors.success} 
      />
      <StatWidget 
        icon="trophy-outline" 
        title={statsData.gradeTitle} 
        value={statsData.grade} 
        color={colors.warning} 
      />
    </View>
  );
});

StatsSection.displayName = 'StatsSection';
