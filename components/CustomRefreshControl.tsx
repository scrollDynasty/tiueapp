import { Colors } from '@/constants/DesignTokens';
import React from 'react';
import { RefreshControl, RefreshControlProps } from 'react-native';

interface CustomRefreshControlProps extends Omit<RefreshControlProps, 'refreshing'> {
  refreshing: boolean;
  onRefresh: () => void;
}

export function CustomRefreshControl({ refreshing, onRefresh, ...props }: CustomRefreshControlProps) {
  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={Colors.brandPrimary}
      colors={[Colors.brandPrimary]}
      progressBackgroundColor={Colors.surface}
      {...props}
    />
  );
}
