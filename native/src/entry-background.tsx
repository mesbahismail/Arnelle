import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useReducedMotion } from "./motion";

const background = {
  uri: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=900&q=85&fit=crop",
};
const blurredIntensity = 60;

export function EntryBackground({ blurred }: { blurred: boolean }) {
  const progress = useRef(
    new Animated.Value(blurred ? blurredIntensity : 0),
  ).current;
  const [intensity, setIntensity] = useState(blurred ? blurredIntensity : 0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const target = blurred ? blurredIntensity : 0;
    // Update the blur prop on both Expo native and web, leaving the photo mounted.
    const listener = progress.addListener(({ value }) => setIntensity(value));
    if (reduced) {
      progress.setValue(target);
      setIntensity(target);
      return () => progress.removeListener(listener);
    }
    const animation = Animated.timing(progress, {
      toValue: target,
      duration: 650,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    });
    animation.start();
    return () => {
      animation.stop();
      progress.removeListener(listener);
    };
  }, [blurred, reduced, progress]);

  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      testID="entry-background"
    >
      <Image
        source={background}
        resizeMode="cover"
        style={[StyleSheet.absoluteFillObject, { opacity: 0.38 }]}
      />
      <BlurView
        testID="entry-background-blur"
        tint="systemUltraThinMaterialDark"
        intensity={intensity}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={["#24262220", "#13171855", "#080a09ee"]}
        style={StyleSheet.absoluteFillObject}
      />
    </View>
  );
}
