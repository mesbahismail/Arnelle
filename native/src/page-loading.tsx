import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import { useReducedMotion } from "./motion";

const pages = [
  "Discover",
  "Browse",
  "Communities",
  "Messaging",
  "Profile",
  "Saved",
  "Followers",
];

/** A short navigation transition; content mounts immediately so images can load. */
export function PageLoading({
  page,
  children,
}: {
  page: string;
  children: React.ReactNode;
}) {
  const enabled = pages.includes(page);
  const [loading, setLoading] = useState(enabled);
  const pulse = useRef(new Animated.Value(0.65)).current;
  const reveal = useRef(new Animated.Value(enabled ? 0 : 1)).current;
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!enabled) return;
    const timer = setTimeout(() => setLoading(false), 360);
    return () => clearTimeout(timer);
  }, [enabled]);

  useEffect(() => {
    if (!loading || reduced) return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 240,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(pulse, {
          toValue: 0.65,
          duration: 240,
          useNativeDriver: Platform.OS !== "web",
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [loading, reduced, pulse]);

  useEffect(() => {
    if (loading) return;
    if (reduced) {
      reveal.setValue(1);
      return;
    }
    const animation = Animated.timing(reveal, {
      toValue: 1,
      duration: 140,
      useNativeDriver: Platform.OS !== "web",
    });
    animation.start();
    return () => animation.stop();
  }, [loading, reduced, reveal]);

  if (!enabled) return <>{children}</>;

  return (
    <View style={styles.root}>
      <Animated.View
        style={[styles.root, { opacity: reveal }]}
        pointerEvents={loading ? "none" : "auto"}
        accessibilityElementsHidden={loading}
        importantForAccessibility={loading ? "no-hide-descendants" : "auto"}
        aria-hidden={loading}
      >
        {children}
      </Animated.View>
      {loading && (
        <View
          style={styles.overlay}
          testID="page-skeleton"
          accessible
          accessibilityLabel={`Loading ${page}`}
          accessibilityRole="progressbar"
          aria-busy
        >
          <Animated.View style={{ gap: 24, opacity: reduced ? 1 : pulse }}>
            <SkeletonLayout page={page} />
          </Animated.View>
        </View>
      )}
    </View>
  );
}

function Block({ style }: { style?: ViewStyle }) {
  return <View style={[styles.block, style]} />;
}

function Person() {
  return (
    <View style={styles.row}>
      <Block style={{ width: 52, height: 52, borderRadius: 26 }} />
      <View style={{ flex: 1, gap: 10 }}>
        <Block style={{ width: "52%", height: 14 }} />
        <Block style={{ width: "78%", height: 10 }} />
      </View>
    </View>
  );
}

function Grid() {
  return (
    <View style={{ gap: 12 }}>
      {[0, 1].map((row) => (
        <View key={row} style={styles.row}>
          <Block style={{ flex: 1, height: 218 }} />
          <Block style={{ flex: 1, height: 218 }} />
        </View>
      ))}
    </View>
  );
}

function SkeletonLayout({ page }: { page: string }) {
  if (page === "Browse" || page === "Saved")
    return (
      <>
        <Block style={{ height: 42, borderRadius: 24 }} />
        <Grid />
      </>
    );
  if (page === "Messaging" || page === "Followers")
    return (
      <>
        {page === "Messaging" && (
          <Block style={{ height: 42, borderRadius: 24 }} />
        )}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Person key={i} />
        ))}
      </>
    );
  if (page === "Profile")
    return (
      <>
        <Person />
        <Block style={{ width: "85%", height: 12 }} />
        <View style={styles.row}>
          {[0, 1, 2].map((i) => (
            <Block key={i} style={{ flex: 1, height: 38 }} />
          ))}
        </View>
        <Grid />
      </>
    );
  if (page === "Communities")
    return (
      <>
        <Block style={{ width: "60%", height: 20 }} />
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ gap: 14 }}>
            <Block style={{ height: 140 }} />
            <Person />
          </View>
        ))}
      </>
    );
  return (
    <>
      <Block style={{ width: "38%", height: 20 }} />
      <View style={styles.row}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={{ flex: 1, alignItems: "center", gap: 10 }}>
            <Block style={{ width: 56, height: 56, borderRadius: 28 }} />
            <Block style={{ width: 44, height: 10 }} />
          </View>
        ))}
      </View>
      <Block style={{ width: "50%", height: 18 }} />
      <Grid />
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, minHeight: 0 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 20,
    overflow: "hidden",
  },
  block: { height: 16, borderRadius: 10, backgroundColor: "#363638" },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
});
