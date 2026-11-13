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
  animate = true,
}: {
  children: React.ReactNode;
  identity: string;
  style?: StyleProp<ViewStyle>;
  animate?: boolean;
}) {
  const value = useRef(new Animated.Value(1)).current;
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced || !animate) {
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
  }, [identity, reduced, value, animate]);
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

/** Keep outgoing comments mounted until their fade and collapse have finished. */
export function LiveComment({
  children,
  style,
  exiting = false,
  onDismiss,
  id,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  exiting?: boolean;
  onDismiss: () => void;
  id: string;
}) {
  const entrance = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const collapse = useRef(new Animated.Value(0)).current;
  const [height, setHeight] = useState(0);
  const [expired, setExpired] = useState(false);
  const dismiss = useRef(onDismiss);
  dismiss.current = onDismiss;
  const reduced = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(() => setExpired(true), 4200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (reduced) {
      entrance.setValue(1);
      return;
    }
    entrance.setValue(0);
    const animation = Animated.spring(entrance, {
      toValue: 1,
      speed: 22,
      bounciness: 4,
      useNativeDriver: nativeDriver,
    });
    animation.start();
    return () => animation.stop();
  }, [entrance, reduced]);

  useEffect(() => {
    if (!exiting && !expired) return;
    if (reduced) {
      dismiss.current();
      return;
    }
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.delay(280),
        Animated.timing(collapse, {
          toValue: 1,
          duration: 220,
          useNativeDriver: false,
        }),
      ]),
    ]);
    animation.start(({ finished }) => {
      if (finished) dismiss.current();
    });
    return () => animation.stop();
  }, [exiting, expired, reduced, opacity, collapse]);

  return (
    <Animated.View
      testID={`live-comment-${id}`}
      style={{
        opacity,
        overflow: "hidden",
        maxWidth: "100%",
        height: height
          ? collapse.interpolate({
              inputRange: [0, 1],
              outputRange: [height + 9, 0],
            })
          : undefined,
      }}
    >
      <Animated.View
        onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
        style={[
          style,
          {
            marginBottom: 9,
            opacity: entrance.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
              extrapolate: "clamp",
            }),
            transform: [
              {
                translateY: entrance.interpolate({
                  inputRange: [0, 1],
                  outputRange: [28, 0],
                }),
              },
              {
                scale: entrance.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.94, 1],
                }),
              },
            ],
          },
        ]}
      >
        {children}
      </Animated.View>
    </Animated.View>
  );
}
