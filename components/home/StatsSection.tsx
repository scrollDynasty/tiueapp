import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
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

  return (
    <View style={{
      flexDirection: 'row',
      marginBottom: 24,
      gap: 8,
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
