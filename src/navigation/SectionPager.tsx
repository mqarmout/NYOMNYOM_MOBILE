import React, { useRef, useCallback } from 'react';
import { ScrollView, View, StyleSheet, useWindowDimensions } from 'react-native';
import { useStore, PAGER } from '../state/store';

interface Props { children: React.ReactNode[]; }

export function SectionPager({ children }: Props) {
  const { width } = useWindowDimensions();
  const section = useStore(s => s.section);
  const go = useStore(s => s.go);
  const ref = useRef<ScrollView>(null);
  const programmatic = useRef(false);

  const idx = PAGER.indexOf(section);

  // Sync scroll position when section changes via tab bar / terminal / store
  const prevIdx = useRef(idx);
  if (prevIdx.current !== idx) {
    prevIdx.current = idx;
    programmatic.current = true;
    ref.current?.scrollTo({ x: idx * width, animated: true });
  }

  const onMomentumScrollEnd = useCallback((e: { nativeEvent: { contentOffset: { x: number } } }) => {
    if (programmatic.current) { programmatic.current = false; return; }
    const page = Math.round(e.nativeEvent.contentOffset.x / width);
    const s = PAGER[page];
    if (s && s !== section) go(s);
  }, [width, section, go]);

  return (
    <ScrollView
      ref={ref}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      scrollEventThrottle={32}
      onMomentumScrollEnd={onMomentumScrollEnd}
      style={styles.scroll}
      contentContainerStyle={[styles.content, { width: width * PAGER.length }]}
      removeClippedSubviews
    >
      {children.map((child, i) => (
        <View key={i} style={[styles.page, { width }]}>
          {child}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { flexDirection: 'row' },
  page: { flex: 1, overflow: 'hidden' },
});
