import React, { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Platform,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
  Text,
} from "react-native";
const nativeDriver = Platform.OS !== "web";
export function useReducedMotion() {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (active) setReduced(value);
      })
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduced,
    );
    return () => {
      active = false;
      sub.remove();
    };
  }, []);
  return reduced;
}
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
export function SpringPressable({
  style,
  onPressIn,
  onPressOut,
  ...props
}: PressableProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const reduced = useReducedMotion();
  useEffect(() => () => scale.stopAnimation(), [scale]);
  const animate = (toValue: number) =>
    Animated.spring(scale, {
      toValue,
      speed: 35,
      bounciness: 5,
      useNativeDriver: nativeDriver,
    }).start();
  return (
    <AnimatedPressable
      {...props}
      onPressIn={(e) => {
        if (!reduced) animate(0.965);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        animate(1);
        onPressOut?.(e);
      }}
      style={(state) => [
        typeof style === "function" ? style(state) : style,
        { transform: [{ scale }] },
      ]}
    />
  );
}
export function Reveal({
  children,
  identity,
  style,
}: {
  children: React.ReactNode;
  identity: string;
  style?: StyleProp<ViewStyle>;
}) {
  const value = useRef(new Animated.Value(1)).current;
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) {
      value.setValue(1);
      return;
    }
    value.setValue(0);
    const animation = Animated.timing(value, {
      toValue: 1,
      duration: 280,
      useNativeDriver: nativeDriver,
    });
    animation.start();
    return () => animation.stop();
  }, [identity, reduced, value]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: value,
          transform: [
            {
              translateY: value.interpolate({
                inputRange: [0, 1],
                outputRange: [10, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
export function FloatingHearts({ burst }: { burst: number }) {
  const progress = useRef(new Animated.Value(0)).current;
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!burst || reduced) return;
    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: nativeDriver,
    });
    animation.start();
    return () => animation.stop();
  }, [burst, reduced, progress]);
  if (!burst || reduced) return null;
  return (
    <Animated.View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        position: "absolute",
        bottom: 110,
        right: 32,
        opacity: progress.interpolate({
          inputRange: [0, 0.15, 0.75, 1],
          outputRange: [0, 1, 0.8, 0],
        }),
        transform: [
          {
            translateY: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -180],
            }),
          },
        ],
      }}
    >
      {[0, 1, 2].map((i) => (
        <Text
          key={i}
          style={{
            color: ["#fff", "#ffb94d", "#ed5478"][i],
            fontSize: 24 + i * 5,
            marginLeft: i % 2 ? 16 : 0,
          }}
        >
          ♥
        </Text>
      ))}
    </Animated.View>
  );
}
