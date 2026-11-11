import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { C } from './theme';
import type { Figure } from './types';

export const Avatar = ({ fig, size = 56, ring }: { fig: Figure; size?: number; ring?: string }) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: C.surface2,
      borderWidth: ring ? 2 : 0,
      borderColor: ring,
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Text style={{ fontSize: size * 0.44 }}>{fig.emoji}</Text>
  </View>
);

export const H1 = ({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) => (
  <Text style={[styles.h1, style]}>{children}</Text>
);

export const H2 = ({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) => (
  <Text style={[styles.h2, style]}>{children}</Text>
);

export const P = ({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) => (
  <Text style={[styles.p, style]}>{children}</Text>
);

export const Btn = ({
  label,
  onPress,
  variant = 'gold',
  style,
  small,
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: 'gold' | 'ghost' | 'dark';
  style?: StyleProp<ViewStyle>;
  small?: boolean;
  disabled?: boolean;
}) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    style={({ pressed }) => [
      styles.btn,
      small && styles.btnSmall,
      variant === 'gold' && { backgroundColor: C.gold },
      variant === 'ghost' && { borderWidth: 1, borderColor: C.line },
      variant === 'dark' && { backgroundColor: C.surface2 },
      (pressed || disabled) && { opacity: 0.7, transform: [{ scale: 0.98 }] },
      style,
    ]}
  >
    <Text
      style={[
        styles.btnText,
        small && { fontSize: 13 },
        { color: variant === 'gold' ? C.onAccent : C.text },
      ]}
    >
      {label}
    </Text>
  </Pressable>
);

export const Chip = ({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) => (
  <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
    <Text style={[styles.chipText, active && { color: C.onAccent }]}>{label}</Text>
  </Pressable>
);

export const Card = ({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) => (
  <View style={[styles.card, style]}>{children}</View>
);

/** Animierter Balken 0–100 */
export const Bar = ({
  value,
  color = C.gold,
  height = 8,
  reverse,
  delay = 0,
}: {
  value: number;
  color?: string;
  height?: number;
  reverse?: boolean;
  delay?: number;
}) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: Math.max(0, Math.min(100, value)),
      duration: 600,
      delay,
      useNativeDriver: false,
    }).start();
  }, [value, delay, anim]);
  return (
    <View style={[styles.barTrack, { height, flexDirection: reverse ? 'row-reverse' : 'row' }]}>
      <Animated.View
        style={{
          height,
          borderRadius: height / 2,
          backgroundColor: color,
          width: anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
        }}
      />
    </View>
  );
};

export const FadeIn = ({
  children,
  delay = 0,
  style,
  from = 16,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
  from?: number;
}) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 420, delay, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [anim, delay]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [from, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

export const Section = ({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) => (
  <View style={{ marginTop: 24 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <H2>{title}</H2>
      {right}
    </View>
    {children}
  </View>
);

const styles = StyleSheet.create({
  h1: { fontWeight: '700', color: C.text, fontSize: 28, letterSpacing: -0.5 },
  h2: { fontWeight: '600', color: C.text, fontSize: 17 },
  p: { color: C.muted, fontSize: 15, lineHeight: 22 },
  btn: {
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSmall: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10 },
  btnText: { fontWeight: '600', fontSize: 15 },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.surface,
    marginRight: 6,
    marginBottom: 8,
  },
  chipActive: { backgroundColor: C.gold, borderColor: C.gold },
  chipText: { color: C.text, fontSize: 13, fontWeight: '500' },
  card: {
    backgroundColor: C.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.line,
    padding: 16,
  },
  barTrack: { backgroundColor: C.surface2, borderRadius: 99, overflow: 'hidden', flex: 1 },
});
