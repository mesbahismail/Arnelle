import { Text, TextInput } from "./typography";
import React, { type ReactNode } from "react";
import {
  View,
  Pressable,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  PanResponder,
  type ViewStyle,
  type StyleProp,
  type TextInputProps,
} from "react-native";
import { SpringPressable } from "./motion";
import { PreviewChrome } from "./preview-chrome";
import { Icon, type IconName } from "./icons";
export { Icon, type IconName } from "./icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { SvgXml } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { colors, avatarSvg, photos, type PhotoKey, space } from "./data";
export function Avatar({
  index = 0,
  size = 48,
  ring = false,
}: {
  index?: number;
  size?: number;
  ring?: boolean;
}) {
  const content = (
    <View
      style={{
        borderRadius: size,
        overflow: "hidden",
        borderWidth: ring ? 2 : 0,
        borderColor: colors.background,
      }}
    >
      <SvgXml
        xml={avatarSvg(index)}
        width={size - (ring ? 6 : 0)}
        height={size - (ring ? 6 : 0)}
      />
    </View>
  );
  return ring ? (
    <LinearGradient
      colors={colors.gradient}
      style={{ padding: 1, borderRadius: size }}
    >
      {content}
    </LinearGradient>
  ) : (
    content
  );
}
export function Action({
  children,
  onPress,
  outline = false,
  disabled = false,
  style,
  label,
}: {
  children: ReactNode;
  onPress: () => void;
  outline?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  label?: string;
}) {
  return (
    <SpringPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      style={({ pressed }) => [
        { opacity: disabled ? 0.4 : pressed ? 0.7 : 1 },
        style,
      ]}
    >
      {outline ? (
        <View style={s.outlineButton}>
          {typeof children === "string" ? (
            <Text style={s.buttonText}>{children}</Text>
          ) : (
            children
          )}
        </View>
      ) : (
        <LinearGradient colors={colors.gradient} style={s.gradientButton}>
          {typeof children === "string" ? (
            <Text style={s.buttonText}>{children}</Text>
          ) : (
            children
          )}
        </LinearGradient>
      )}
    </SpringPressable>
  );
}
export function IconButton({
  name,
  onPress,
  label,
  gradient = false,
  size = 40,
}: {
  name: IconName;
  onPress: () => void;
  label: string;
  gradient?: boolean;
  size?: number;
}) {
  return (
    <SpringPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
    >
      {gradient ? (
        <LinearGradient
          colors={colors.gradient}
          style={[s.iconButton, { width: size, height: size, borderWidth: 0 }]}
        >
          <Icon name={name} />
        </LinearGradient>
      ) : (
        <View style={[s.iconButton, { width: size, height: size }]}>
          <Icon name={name} />
        </View>
      )}
    </SpringPressable>
  );
}
export function Header({
  title,
  left = "camera",
  onLeft,
  right = "notifications",
  onRight,
  titleAccessory,
  onTitlePress,
  borderless = false,
}: {
  title: string;
  left?: IconName;
  onLeft: () => void;
  right?: IconName;
  onRight?: () => void;
  titleAccessory?: ReactNode;
  onTitlePress?: () => void;
  borderless?: boolean;
}) {
  return (
    <View style={[s.header, borderless && { borderBottomWidth: 0 }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          left === "chevron-back"
            ? "Go back"
            : left === "close"
              ? "Close screen"
              : left === "add"
                ? "Add new"
                : "Open camera"
        }
        onPress={onLeft}
        style={s.headerIcon}
      >
        <Icon name={left} />
      </Pressable>
      <Pressable
        accessibilityRole={onTitlePress ? "button" : undefined}
        accessibilityLabel={
          onTitlePress ? `View story by ${title.replace("@", "")}` : undefined
        }
        disabled={!onTitlePress}
        onPress={onTitlePress}
        style={[s.row, { justifyContent: "center" }]}
      >
        {titleAccessory}
        <Text style={s.headerTitle}>{title}</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={right === "menu" ? "Open menu" : "More options"}
        onPress={onRight}
        style={s.headerIcon}
      >
        {onRight && <Icon name={right} />}
      </Pressable>
    </View>
  );
}
export function SearchField(props: TextInputProps) {
  return (
    <View style={s.search}>
      <Icon name="search" color={colors.muted} size={19} />
      <TextInput
        placeholderTextColor={colors.muted}
        style={s.searchInput}
        accessibilityLabel={props.placeholder}
        {...props}
      />
      {!!props.value && (
        <Pressable
          accessibilityLabel="Clear search"
          onPress={() => props.onChangeText?.("")}
        >
          <Icon name="close" size={19} />
        </Pressable>
      )}
    </View>
  );
}
export function Section({
  title,
  onMore,
}: {
  title: string;
  onMore: () => void;
}) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`See all ${title}`}
        onPress={onMore}
        style={s.seeAll}
      >
        <Text style={s.small}>See all</Text>
        <Icon name="arrow-forward" size={18} />
      </Pressable>
    </View>
  );
}
export function Photo({
  image,
  style,
}: {
  image: PhotoKey;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Image
      source={{ uri: photos[image] }}
      style={[StyleSheet.absoluteFillObject, style as never]}
      resizeMode="cover"
    />
  );
}
export function Shade() {
  return (
    <LinearGradient
      colors={["transparent", "#000000b8"]}
      style={StyleSheet.absoluteFillObject}
    />
  );
}
export function Sheet({
  title,
  visible,
  onClose,
  children,
}: {
  title: string;
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const pan = PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => g.dy > 12 && Math.abs(g.dx) < 30,
    onPanResponderRelease: (_, g) => {
      if (g.dy > 60) onClose();
    },
  });
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={s.modal}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close sheet"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
        <BlurView
          intensity={75}
          tint="dark"
          style={[s.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}
        >
          <View {...pan.panHandlers} style={s.sheetDrag}>
            <View style={s.handle} />
          </View>
          <View style={s.sheetHeading}>
            <Text style={s.sheetTitle}>{title}</Text>
            <IconButton
              name="close"
              label="Close sheet"
              onPress={onClose}
              size={32}
            />
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </BlurView>
        <PreviewChrome homeOnly />
      </View>
    </Modal>
  );
}
export function Divider({
  children,
  first = false,
}: {
  children: string;
  first?: boolean;
}) {
  return (
    <View style={[s.divider, first && { marginTop: 24 }]}>
      <LinearGradient
        colors={["#77777700", "#777777"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={s.line}
      />
      <Text style={s.dividerText}>{children}</Text>
      <LinearGradient
        colors={["#777777", "#77777700"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={s.line}
      />
    </View>
  );
}
export const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  text: { color: colors.text, fontSize: 16 },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  small: { color: colors.text, fontSize: 13 },
  row: { flexDirection: "row", alignItems: "center", gap: space.sm },
  content: { padding: space.gutter, paddingBottom: 40 },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "500",
    color: colors.text,
    letterSpacing: -0.5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 64,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { color: colors.text, fontSize: 16, fontWeight: "500" },
  headerIcon: {
    width: 38,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  gradientButton: {
    height: 44,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#ffe3b7",
  },
  outlineButton: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#ffffff66",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },
  buttonText: { color: colors.text, fontSize: 16, fontWeight: "500" },
  iconButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: "#ffffff66",
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#79797d",
    borderRadius: 12,
    paddingHorizontal: 13,
    minHeight: 44,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    paddingVertical: 11,
  },
  section: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
    marginTop: 8,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: "500",
    letterSpacing: -0.5,
  },
  seeAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#ffffff66",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 30,
  },
  modal: { flex: 1, backgroundColor: "#0008", justifyContent: "flex-end" },
  sheet: {
    maxHeight: "89%",
    backgroundColor: "#242628e8",
    borderTopWidth: 1,
    borderColor: "#67676c",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: space.gutter,
    overflow: "hidden",
  },
  sheetDrag: { height: 34, alignItems: "center", justifyContent: "center" },
  handle: { height: 6, width: 40, borderRadius: 6, backgroundColor: "#747477" },
  sheetHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 24,
  },
  sheetTitle: { fontSize: 27, fontWeight: "500", color: colors.text },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 38,
    marginBottom: 23,
  },
  dividerText: {
    color: "#a4a4a8",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.8,
  },
  line: { flex: 1, height: 1 },
});
