import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Avatar, IconButton } from "./ui";
import { Text } from "./typography";
import { PreviewChrome } from "./preview-chrome";
import { creators, photos, type PhotoKey } from "./data";
export function StoryViewer({
  creator,
  onClose,
}: {
  creator: (typeof creators)[number];
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [replay, setReplay] = useState(0);
  const [paused, setPaused] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const close = useRef(onClose);
  close.current = onClose;
  const stories: PhotoKey[] = ["travel", "nature", "hike"];
  useEffect(() => {
    progress.setValue(0);
  }, [index, replay, progress]);
  useEffect(() => {
    if (paused) return;
    let animation: Animated.CompositeAnimation;
    let cancelled = false;
    progress.stopAnimation((value) => {
      if (cancelled) return;
      animation = Animated.timing(progress, {
        toValue: 1,
        duration: (1 - value) * 7000,
        useNativeDriver: false,
      });
      animation.start(({ finished }) => {
        if (finished) {
          if (index < 2) setIndex((previous) => previous + 1);
          else close.current();
        }
      });
    });
    return () => {
      cancelled = true;
      animation?.stop();
    };
  }, [index, paused, replay, progress]);
  return (
    <View style={{ flex: 1, backgroundColor: "#111" }} testID="story-viewer">
      <Image
        source={{ uri: photos[stories[index]] }}
        resizeMode="cover"
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={["#000b", "#0000", "#0008"]}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            gap: 4,
            paddingHorizontal: 16,
            paddingTop: 8,
          }}
        >
          {stories.map((_, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: 2,
                backgroundColor: "#ffffff55",
                overflow: "hidden",
              }}
            >
              <Animated.View
                style={{
                  height: 2,
                  backgroundColor: "#fff",
                  width:
                    i < index
                      ? "100%"
                      : i === index
                        ? progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: ["0%", "100%"],
                          })
                        : "0%",
                }}
              />
            </View>
          ))}
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            padding: 16,
          }}
        >
          <Avatar index={creator.avatar} size={36} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
              @{creator.handle}
            </Text>
            <Text style={{ color: "#ffffff99", fontSize: 12 }}>
              Story {index + 1} of 3
            </Text>
          </View>
          <IconButton
            name={paused ? "play" : "pause"}
            label={paused ? "Resume story" : "Pause story"}
            onPress={() => setPaused((value) => !value)}
            size={32}
          />
          <IconButton
            name="close"
            label="Close story"
            onPress={onClose}
            size={32}
          />
        </View>
        <View style={{ flex: 1, flexDirection: "row" }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Previous story"
            style={{ flex: 1 }}
            onPress={() => {
              setIndex((value) => Math.max(0, value - 1));
              setReplay((value) => value + 1);
            }}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Next story"
            style={{ flex: 2 }}
            onPress={() =>
              index < 2 ? setIndex((value) => value + 1) : onClose()
            }
          />
        </View>
        <Text
          style={{
            color: "#ffffff99",
            fontSize: 12,
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          A moment from @{creator.handle}
        </Text>
      </SafeAreaView>
      <PreviewChrome />
    </View>
  );
}
