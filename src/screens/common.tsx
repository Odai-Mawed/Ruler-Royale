import React, { useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type ScrollViewInstance, type StyleProp, type ViewStyle } from 'react-native';
import { useNav } from '../nav';
import { C, MAX_W } from '../theme';

export const Screen = ({
  children,
  contentStyle,
  autoScroll,
}: {
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  autoScroll?: boolean;
}) => {
  const ref = useRef<ScrollViewInstance>(null);
  return (
    <ScrollView
      ref={ref}
      style={{ flex: 1 }}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
      onContentSizeChange={() => autoScroll && ref.current?.scrollToEnd({ animated: true })}
    >
      <View style={[styles.inner, contentStyle]}>{children}</View>
    </ScrollView>
  );
};

export const OverlayHeader = ({ title, right }: { title?: string; right?: React.ReactNode }) => {
  const nav = useNav();
  return (
    <View style={styles.header}>
      <View style={styles.headerInner}>
        <Pressable onPress={nav.close} hitSlop={12} style={styles.back} accessibilityLabel="Zurück">
          <Text style={{ color: C.text, fontSize: 22 }}>‹</Text>
          <Text style={{ color: C.text, fontWeight: '500', fontSize: 14 }}>Zurück</Text>
        </Pressable>
        {title ? (
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        ) : (
          <View style={{ flex: 1 }} />
        )}
        <View style={{ minWidth: 70, alignItems: 'flex-end' }}>{right}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scroll: { paddingBottom: 48 },
  inner: { width: '100%', maxWidth: MAX_W, alignSelf: 'center', paddingHorizontal: 16, paddingTop: 16 },
  header: { borderBottomWidth: 1, borderBottomColor: C.line, backgroundColor: C.bg2 },
  headerInner: {
    width: '100%',
    maxWidth: MAX_W,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  back: { flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 70 },
  title: { flex: 1, textAlign: 'center', color: C.text, fontWeight: '600', fontSize: 16 },
});
