import { LinearGradient } from 'expo-linear-gradient';
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
import { ERA_COLORS, eraOf } from './data/arenas';
import { C, F } from './theme';
import type { Figure } from './types';

export const Avatar = ({ fig, size = 56, ring }: { fig: Figure; size?: number; ring?: string }) => {
  const [c1, c2] = ERA_COLORS[eraOf(fig.year)];
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        padding: ring ? 3 : 0,
        backgroundColor: ring ?? 'transparent',
      }}
    >
      <LinearGradient
        colors={[c1, c2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}
      >
        <Text style={{ fontSize: size * 0.46 }}>{fig.emoji}</Text>
      </LinearGradient>
    </View>
  );
};

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
      variant === 'ghost' && { borderWidth: 1, borderColor: C.gold },
      variant === 'dark' && { backgroundColor: C.surface2 },
      (pressed || disabled) && { opacity: 0.7, transform: [{ scale: 0.98 }] },
      style,
    ]}
  >
    <Text
      style={[
        styles.btnText,
        small && { fontSize: 13 },
        { color: variant === 'gold' ? '#1a1406' : variant === 'ghost' ? C.gold : C.text },
      ]}
    >
      {label}
    </Text>
  </Pressable>
);

export const Chip = ({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) => (
  <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
    <Text style={[styles.chipText, active && { color: '#1a1406' }]}>{label}</Text>
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

export const Pulse = ({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(anim, { toValue: 0, duration: 900, useNativeDriver: Platform.OS !== 'web' }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);
  return (
    <Animated.View
      style={[style, { transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }] }]}
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
  h1: { fontFamily: F.display, color: C.gold, fontSize: 28, letterSpacing: 1 },
  h2: { fontFamily: F.title, color: C.text, fontSize: 18, letterSpacing: 0.5 },
  p: { color: C.muted, fontSize: 15, lineHeight: 22 },
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSmall: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10 },
  btnText: { fontFamily: F.title, fontSize: 16, letterSpacing: 0.5 },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.surface,
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: { backgroundColor: C.gold, borderColor: C.gold },
  chipText: { color: C.text, fontSize: 13, fontWeight: '600' },
  card: {
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.line,
    padding: 16,
  },
  barTrack: { backgroundColor: C.surface2, borderRadius: 99, overflow: 'hidden', flex: 1 },
});
