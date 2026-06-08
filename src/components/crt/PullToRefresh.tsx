import React, { useState, useCallback } from 'react';
import { ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { haptic } from '../../native/haptics';

interface Props {
  children: React.ReactNode;
  onRefresh?: () => Promise<void>;
  contentContainerStyle?: object;
}

export function PullToRefresh({ children, onRefresh, contentContainerStyle }: Props) {
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (refreshing || !onRefresh) return;
    haptic.light();
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, onRefresh]);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={theme.accent}
          colors={[theme.accent]}
        />
      }
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
});
