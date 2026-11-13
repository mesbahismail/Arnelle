import React, { Children, useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BrandMark } from "./brand";
import { Text } from "./typography";
import { useReducedMotion } from "./motion";

export function WelcomeIntro({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const fromSplash = useRef(loading);
  const logo = useRef(new Animated.Value(loading ? 0 : 1)).current;
  const reveals = useRef(
    Array.from({ length: 5 }, () => new Animated.Value(loading ? 0 : 1)),
  ).current;
  const offset = height / 2 - insets.top - 48 - 54;

  useEffect(() => {
    if (loading) return;
    if (reduced || !fromSplash.current) {
      logo.setValue(1);
      reveals.forEach((value) => value.setValue(1));
      return;
    }
    const animation = Animated.parallel([
      Animated.timing(logo, {
        toValue: 1,
        duration: 720,
        easing: Easing.bezier(0.22, 1, 0.36, 1),
        useNativeDriver: Platform.OS !== "web",
      }),
      ...reveals.map((value, index) =>
        Animated.sequence([
          Animated.delay(180 + index * 85),
          Animated.timing(value, {
            toValue: 1,
            duration: 420,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: Platform.OS !== "web",
          }),
        ]),
      ),
    ]);
    animation.start(({ finished }) => {
      if (finished) fromSplash.current = false;
    });
    return () => animation.stop();
  }, [loading, reduced, logo, reveals]);

  const revealStyle = (value: Animated.Value) => ({
    opacity: value,
    transform: [
      {
        translateY: value.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
    ],
  });

  return (
    <View style={{ flex: 1 }}>
      <View style={{ alignItems: "center" }}>
        <Animated.View
          testID="welcome-logo"
          style={{
            transform: [
              {
                translateY: logo.interpolate({
                  inputRange: [0, 1],
                  outputRange: [offset, 0],
                }),
              },
            ],
          }}
        >
          <View
            testID={loading ? "startup-logo" : undefined}
            accessibilityLabel={loading ? "Loading Arnelle" : undefined}
            aria-busy={loading}
          >
            <BrandMark size={108} />
          </View>
        </Animated.View>
        <Animated.View
          testID="welcome-copy"
          aria-hidden={loading}
          accessibilityElementsHidden={loading}
          importantForAccessibility={loading ? "no-hide-descendants" : "auto"}
          style={[styles.copy, revealStyle(reveals[0])]}
        >
          <Text style={styles.wordmark}>ARNELLE</Text>
          <Text style={styles.subtitle}>
            Every photo is a doorway back{`\n`}to a memory.
          </Text>
          <View style={styles.dash} />
        </Animated.View>
      </View>
      <View style={{ flex: 1, minHeight: 48 }} />
      {Children.toArray(children).map((child, index) => (
        <Animated.View
          key={index}
          testID={`welcome-action-${index}`}
          pointerEvents={loading ? "none" : "auto"}
          aria-hidden={loading}
          accessibilityElementsHidden={loading}
          importantForAccessibility={loading ? "no-hide-descendants" : "auto"}
          style={revealStyle(reveals[index + 1])}
        >
          {child}
        </Animated.View>
      ))}
      <View style={{ height: 24 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  copy: { alignItems: "center" },
  wordmark: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: 2,
    marginTop: 24,
    marginBottom: 8,
  },
  subtitle: {
    color: "#e3e3e3",
    fontSize: 20,
    lineHeight: 30,
    textAlign: "center",
  },
  dash: { height: 4, width: 32, backgroundColor: "#b3b3ad", marginTop: 18 },
});
