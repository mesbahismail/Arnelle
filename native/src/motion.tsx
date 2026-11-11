import { Heart } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Platform,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
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
  const [pressed, setPressed] = useState(false);
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
        setPressed(true);
        if (!reduced) animate(0.965);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        animate(1);
        onPressOut?.(e);
      }}
      style={[
        typeof style === "function" ? style({ pressed }) : style,
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
function HeartParticle({
  id,
  onDone,
}: {
  id: number;
  onDone: (id: number) => void;
}) {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay((id % 3) * 180),
      Animated.timing(progress, {
        toValue: 1,
        duration: 2600 + (id % 3) * 200,
        useNativeDriver: nativeDriver,
      }),
    ]);
    animation.start(({ finished }) => {
      if (finished) onDone(id);
    });
    return () => animation.stop();
  }, [id, progress]);
  const drift = id % 2 ? 14 : -12;
  return (
    <Animated.View
      testID="live-heart"
      style={{
        position: "absolute",
        bottom: 0,
        right: 0,
        opacity: progress.interpolate({
          inputRange: [0, 0.08, 0.35, 0.7, 1],
          outputRange: [0, 0.95, 0.75, 0.4, 0],
        }),
        transform: [
          {
            translateY: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -170 - (id % 4) * 15],
            }),
          },
          {
            translateX: progress.interpolate({
              inputRange: [0, 0.35, 0.7, 1],
              outputRange: [0, drift, -drift / 2, drift / 2],
            }),
          },
          {
            scale: progress.interpolate({
              inputRange: [0, 0.15, 1],
              outputRange: [0.7, 1, 0.85],
            }),
          },
        ],
      }}
    >
      <Heart
        size={23 + (id % 3) * 3}
        fill="white"
        color="white"
        strokeWidth={0}
      />
    </Animated.View>
  );
}
export function FloatingHearts({ burst }: { burst: number }) {
  const [particles, setParticles] = useState<number[]>([]);
  const counter = useRef(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!burst || reduced) return;
    const batch = [counter.current++, counter.current++, counter.current++];
    setParticles((previous) => [...previous.slice(-9), ...batch]);
  }, [burst, reduced]);
  if (reduced) return null;
  return (
    <Animated.View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ position: "absolute", right: 28, bottom: 88 }}
    >
      {particles.map((id) => (
        <HeartParticle
          key={id}
          id={id}
          onDone={(finished) =>
            setParticles((previous) =>
              previous.filter((item) => item !== finished),
            )
          }
        />
      ))}
    </Animated.View>
  );
}

/** New comments rise into the room, then gently fade as the conversation moves on. */
export function LiveComment({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const progress = useRef(new Animated.Value(0)).current;
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) {
      progress.setValue(1);
      return;
    }
    const animation = Animated.sequence([
      Animated.timing(progress, {
        toValue: 1,
        duration: 380,
        useNativeDriver: nativeDriver,
      }),
      Animated.delay(3400),
      Animated.timing(progress, {
        toValue: 0.25,
        duration: 2000,
        useNativeDriver: nativeDriver,
      }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [progress, reduced]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [12, 0],
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
