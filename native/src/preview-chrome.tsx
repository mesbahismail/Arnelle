import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { Svg, Path, Rect } from "react-native-svg";
/** Browser-only device chrome. Physical iPhones use their own system bars. */
export function PreviewChrome({ homeOnly = false }: { homeOnly?: boolean }) {
  if (Platform.OS !== "web") return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {!homeOnly && (
        <View style={styles.status}>
          <View style={styles.timeRow}>
            <Text style={styles.time}>9:41</Text>
            <Svg width={13} height={13} viewBox="0 0 16 16">
              <Path
                d="M14.7 1.3 9.2 14.4c-.4.8-1.3.6-1.5-.2L6.5 9.5 1.8 8.3C1 8.1.8 7.2 1.6 6.8z"
                fill="white"
              />
            </Svg>
          </View>
          <View style={styles.island}>
            <View style={styles.camera} />
          </View>
          <View style={styles.indicators}>
            <Svg width={20} height={14} viewBox="0 0 20 14">
              {[5, 8, 11, 14].map((h, i) => (
                <Rect
                  key={i}
                  x={i * 5}
                  y={14 - h}
                  width={3.5}
                  height={h}
                  rx={1}
                  fill={i < 3 ? "#fff" : "#5b5b5b"}
                />
              ))}
            </Svg>
            <Svg width={18} height={15} viewBox="0 0 20 16">
              <Path
                d="M1.5 5Q10-2 18.5 5M4.5 8Q10 3.5 15.5 8M7.5 11Q10 9 12.5 11"
                fill="none"
                stroke="#fff"
                strokeWidth={2.4}
              />
              <Path d="m8.5 13 1.5 2 1.5-2z" fill="#fff" />
            </Svg>
            <View style={styles.battery}>
              <View style={styles.charge} />
              <Text style={styles.batteryText}>32</Text>
              <View style={styles.batteryTip} />
            </View>
          </View>
        </View>
      )}
      <View style={styles.home} />
    </View>
  );
}
const styles = StyleSheet.create({
  status: {
    height: 59,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 41,
    paddingRight: 28,
  },
  timeRow: { flexDirection: "row", gap: 5, alignItems: "center" },
  time: { color: "#fff", fontSize: 17, fontWeight: "600", letterSpacing: 0.2 },
  island: {
    position: "absolute",
    width: 122,
    height: 36,
    borderRadius: 30,
    backgroundColor: "#050505",
    top: 12,
    left: "50%",
    transform: [{ translateX: -61 }],
  },
  camera: {
    position: "absolute",
    right: 13,
    top: 13,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#040816",
    borderWidth: 2,
    borderColor: "#0a1128",
  },
  indicators: { flexDirection: "row", alignItems: "center", gap: 10 },
  battery: {
    width: 25,
    height: 14,
    borderRadius: 4,
    backgroundColor: "#626262",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  charge: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 8,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    backgroundColor: "#ffd84a",
  },
  batteryText: { color: "#080808", fontSize: 11, fontWeight: "600" },
  batteryTip: {
    width: 2,
    height: 5,
    borderRadius: 1,
    position: "absolute",
    right: -3,
    backgroundColor: "#777",
  },
  home: {
    position: "absolute",
    bottom: 12,
    height: 5,
    width: 139,
    borderRadius: 5,
    backgroundColor: "#999",
    left: "50%",
    transform: [{ translateX: -69.5 }],
  },
});
