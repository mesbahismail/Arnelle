import React from "react";
import {
  Text as NativeText,
  TextInput as NativeTextInput,
  StyleSheet,
  type TextProps,
  type TextInputProps,
  type TextStyle,
  type StyleProp,
} from "react-native";
import { useFonts } from "expo-font";
import { DMSans_300Light } from "@expo-google-fonts/dm-sans/300Light";
import { DMSans_400Regular } from "@expo-google-fonts/dm-sans/400Regular";
import { DMSans_500Medium } from "@expo-google-fonts/dm-sans/500Medium";
import { DMSans_600SemiBold } from "@expo-google-fonts/dm-sans/600SemiBold";
export function useAppFonts() {
  return useFonts({
    DMSans_300Light,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
  });
}
function typeStyle(style: StyleProp<TextStyle>): TextStyle {
  const original = StyleSheet.flatten(style) || {};
  const weight =
    original.fontWeight === "bold" ? 700 : Number(original.fontWeight || 400);
  const fontFamily =
    weight >= 700
      ? "DMSans_600SemiBold"
      : weight >= 600
        ? "DMSans_500Medium"
        : weight >= 500
          ? "DMSans_400Regular"
          : "DMSans_300Light";
  return {
    fontFamily,
    fontWeight: "normal",
    ...(original.fontSize
      ? {
          fontSize:
            original.fontSize > 12 ? original.fontSize - 1 : original.fontSize,
        }
      : {}),
  };
}
export function Text({ style, ...props }: TextProps) {
  return <NativeText {...props} style={[style, typeStyle(style)]} />;
}
export const TextInput = React.forwardRef<NativeTextInput, TextInputProps>(
  function TextInput({ style, ...props }, ref) {
    return (
      <NativeTextInput ref={ref} {...props} style={[style, typeStyle(style)]} />
    );
  },
);
