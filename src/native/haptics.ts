import * as Haptics from 'expo-haptics';

export const haptic = {
  select: () => Haptics.selectionAsync().catch(() => {}),
  commit: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}),
  warn:   () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {}),
  error:  () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {}),
  tap:    () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}),
  light:  () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}),
};
