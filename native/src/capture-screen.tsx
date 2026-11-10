import React, { useEffect, useRef, useState } from "react";
import {
  AppState,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Action, Icon, IconButton, Sheet } from "./ui";
import { SpringPressable } from "./motion";
import { Text } from "./typography";
import { PhotoEffects } from "./photo-effects";
import { colors, photos, type PhotoKey } from "./data";
const filters: { name: string; image: PhotoKey }[] = [
  { name: "Default", image: "hike" },
  { name: "Black & White", image: "pottery" },
  { name: "Popstar", image: "music" },
  { name: "Twilight", image: "city" },
];
export function CaptureScreen({
  onClose,
  onPhoto,
  onLibrary,
  filter,
  onFilter,
}: {
  onClose: () => void;
  onPhoto: (uri: string) => void;
  onLibrary: () => void;
  filter: string;
  onFilter: (filter: string) => void;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [flash, setFlash] = useState(false);
  const [delay, setDelay] = useState(3);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [settings, setSettings] = useState(false);
  const [error, setError] = useState("");
  const [foreground, setForeground] = useState(true);
  const camera = useRef<CameraView>(null);
  const mounted = useRef(true);
  const taking = useRef(false);
  const insets = useSafeAreaInsets();
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      setForeground(state === "active");
      if (state !== "active") setCountdown(null);
    });
    return () => {
      mounted.current = false;
      subscription.remove();
    };
  }, []);
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setCountdown(null);
      void takePhoto();
      return;
    }
    const timer = setTimeout(
      () => setCountdown((value) => (value === null ? null : value - 1)),
      1000,
    );
    return () => clearTimeout(timer);
  }, [countdown]);
  async function enableCamera() {
    setError("");
    try {
      const result = permission?.granted
        ? permission
        : await requestPermission();
      if (!mounted.current) return;
      if (result.granted) {
        setReady(false);
        setEnabled(true);
        setSettings(false);
      } else
        setError(
          "Camera access is off. Enable it in Settings, choose a photo, or use the demo scene.",
        );
    } catch {
      if (mounted.current)
        setError(
          "Camera unavailable. You can choose a photo or use the demo scene.",
        );
    }
  }
  async function takePhoto() {
    if (taking.current || (enabled && !ready)) return;
    taking.current = true;
    setBusy(true);
    setError("");
    try {
      const picture = enabled
        ? await camera.current?.takePictureAsync({ quality: 0.85 })
        : { uri: photos.hike };
      if (!picture) throw new Error("No photo");
      if (!mounted.current) return;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
      onPhoto(picture.uri);
    } catch {
      if (mounted.current) {
        setError(
          "Could not capture this photo. Try again or choose one from your library.",
        );
        setSettings(true);
      }
    } finally {
      taking.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  function shutter() {
    if (busy || (enabled && !ready)) return;
    if (countdown !== null) {
      setCountdown(null);
      return;
    }
    if (delay) setCountdown(delay);
    else void takePhoto();
  }
  return (
    <View
      style={{ flex: 1, backgroundColor: "#252a1d" }}
      testID="capture-screen"
    >
      <View style={c.toolbar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close camera"
          style={c.tool}
          onPress={onClose}
        >
          <Icon name="close" size={21} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Toggle flash"
          accessibilityState={{ selected: flash }}
          style={c.tool}
          onPress={() => setFlash((value) => !value)}
        >
          <Icon name={flash ? "flash" : "flash-off"} size={21} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Capture timer ${delay ? `${delay} seconds` : "off"}`}
          style={c.tool}
          onPress={() => {
            setCountdown(null);
            setDelay((value) => (value === 3 ? 10 : value === 10 ? 0 : 3));
          }}
        >
          <Text style={{ color: "#fff", fontSize: 17, fontWeight: "600" }}>
            {delay ? `${delay}s` : "Off"}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Capture settings"
          style={c.tool}
          onPress={() => {
            setCountdown(null);
            setSettings(true);
          }}
        >
          <Icon name="settings" size={21} />
        </Pressable>
      </View>
      <View style={{ flex: 1, overflow: "hidden" }}>
        {enabled && permission?.granted && foreground ? (
          <CameraView
            ref={camera}
            style={StyleSheet.absoluteFillObject}
            facing={facing}
            flash={flash ? "on" : "off"}
            onCameraReady={() => setReady(true)}
            onMountError={() => {
              setEnabled(false);
              setError(
                "Camera unavailable. The demo scene is ready to capture.",
              );
              setSettings(true);
            }}
          />
        ) : (
          <PhotoEffects uri={photos.hike} filter={filter} />
        )}
        <LinearGradient
          pointerEvents="none"
          colors={["#0000", "#0000", "#000b", "#080a08f0"]}
          locations={[0, 0.48, 0.85, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        {countdown !== null && (
          <View pointerEvents="none" style={c.countdown}>
            <Text
              accessibilityRole="alert"
              style={{ color: "#fff", fontSize: 72, fontWeight: "600" }}
            >
              {countdown || ""}
            </Text>
          </View>
        )}
        <View style={[c.bottom, { paddingBottom: insets.bottom + 20 }]}>
          <View style={c.controls}>
            <IconButton
              name="image"
              label="Choose photo from library"
              size={48}
              onPress={() => {
                setCountdown(null);
                onLibrary();
              }}
            />
            <SpringPressable
              accessibilityRole="button"
              accessibilityLabel={
                countdown !== null ? "Cancel capture timer" : "Take photo"
              }
              accessibilityState={{ disabled: busy || (enabled && !ready) }}
              disabled={busy || (enabled && !ready)}
              onPress={shutter}
              style={[
                c.shutter,
                { opacity: busy || (enabled && !ready) ? 0.5 : 1 },
              ]}
            >
              <LinearGradient colors={colors.gradient} style={c.shutterFill}>
                <Icon name="aperture" size={36} />
              </LinearGradient>
            </SpringPressable>
            <IconButton
              name="camera-reverse"
              label="Switch camera"
              size={48}
              onPress={() => {
                setCountdown(null);
                if (!enabled) void enableCamera();
                else {
                  setReady(false);
                  setFacing((value) => (value === "back" ? "front" : "back"));
                }
              }}
            />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={c.filters}
          >
            {filters.map((item) => (
              <Pressable
                key={item.name}
                accessibilityRole="button"
                accessibilityLabel={`Filter ${item.name}`}
                accessibilityState={{ selected: filter === item.name }}
                onPress={() => onFilter(item.name)}
                style={[
                  c.filter,
                  filter === item.name && {
                    borderColor: colors.accent,
                    backgroundColor: "#e779492b",
                  },
                ]}
              >
                <Image
                  source={{ uri: photos[item.image] }}
                  style={{ width: 26, height: 26, borderRadius: 13 }}
                />
                <Text style={{ color: "#fff", fontSize: 14 }}>{item.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
      <Sheet
        visible={settings}
        title="Capture settings"
        onClose={() => setSettings(false)}
      >
        {error ? (
          <Text
            accessibilityRole="alert"
            style={{ color: "#ffbcaa", marginBottom: 24, lineHeight: 20 }}
          >
            {error}
          </Text>
        ) : null}
        <Action onPress={() => void enableCamera()}>
          {enabled ? "Device camera enabled" : "Use device camera"}
        </Action>
        <Action
          outline
          style={{ marginTop: 16 }}
          onPress={() => {
            setEnabled(false);
            setError("");
            setSettings(false);
          }}
        >
          Use demo scene
        </Action>
        <Text style={{ color: "#ffffff99", marginTop: 24, marginBottom: 12 }}>
          CAPTURE TIMER
        </Text>
        <View style={{ flexDirection: "row", gap: 12 }}>
          {[0, 3, 10].map((value) => (
            <Action
              key={value}
              outline={delay !== value}
              style={{ flex: 1 }}
              onPress={() => setDelay(value)}
            >
              {value ? `${value}s` : "Off"}
            </Action>
          ))}
        </View>
        {Platform.OS === "web" && (
          <Text
            style={{
              color: "#ffffff99",
              fontSize: 12,
              lineHeight: 18,
              marginTop: 20,
            }}
          >
            Use a connected camera, choose a photo, or capture the demo scene.
          </Text>
        )}
      </Sheet>
    </View>
  );
}
const c = StyleSheet.create({
  toolbar: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "#ffffff55",
    backgroundColor: "#42482dcc",
  },
  tool: {
    height: 44,
    width: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  bottom: { position: "absolute", bottom: 0, left: 0, right: 0 },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 40,
    marginBottom: 24,
  },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    padding: 5,
    borderWidth: 1.5,
    borderColor: "#ffffffbb",
    backgroundColor: "#ffffff18",
  },
  shutterFill: {
    flex: 1,
    borderRadius: 34,
    justifyContent: "center",
    alignItems: "center",
  },
  filters: { paddingHorizontal: 20, gap: 8 },
  filter: {
    height: 34,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 3,
    paddingRight: 12,
    gap: 8,
    borderWidth: 1.5,
    borderColor: "#ffffff66",
    borderRadius: 24,
    backgroundColor: "#00000044",
  },
  countdown: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});
