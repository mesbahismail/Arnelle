import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  type TextInput as NativeTextInput,
} from "react-native";
import { IconButton } from "./ui";
import { Text, TextInput } from "./typography";

export function ViewerReplyBar({
  kind,
  onReply,
  onLike,
  liked,
  onComposingChange,
}: {
  kind: "story" | "reel";
  onReply: (text: string) => void;
  onLike: () => void;
  liked: boolean;
  onComposingChange?: (composing: boolean) => void;
}) {
  const [draft, setDraft] = useState("");
  const [focused, setFocused] = useState(false);
  const [sent, setSent] = useState(false);
  const input = useRef<NativeTextInput>(null);
  useEffect(() => {
    onComposingChange?.(focused || draft.length > 0);
  }, [focused, draft, onComposingChange]);
  useEffect(() => {
    if (!sent) return;
    const timer = setTimeout(() => setSent(false), 2200);
    return () => clearTimeout(timer);
  }, [sent]);
  const send = () => {
    const text = draft.trim();
    if (!text) return;
    onReply(text);
    setDraft("");
    setSent(true);
    input.current?.blur();
    setFocused(false);
  };
  return (
    <View style={styles.container}>
      {sent && (
        <Text accessibilityRole="alert" style={styles.sent}>
          Message sent
        </Text>
      )}
      <View style={styles.row}>
        <TextInput
          ref={input}
          accessibilityLabel={`${kind === "story" ? "Story" : "Reel"} reply`}
          placeholder="Type something…"
          placeholderTextColor="#ffffff99"
          value={draft}
          onChangeText={setDraft}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSubmitEditing={send}
          returnKeyType="send"
          maxLength={1000}
          style={styles.input}
        />
        <IconButton
          gradient
          name={draft.trim() ? "send" : liked ? "heart" : "heart-outline"}
          label={
            draft.trim()
              ? `Send ${kind} reply`
              : `${liked ? "Unlike" : "Like"} ${kind}`
          }
          onPress={draft.trim() ? send : onLike}
          size={48}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#ffffff66",
    backgroundColor: "#ffffff0d",
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#fff",
    fontSize: 15,
  },
  sent: { color: "#fff", fontSize: 12, paddingHorizontal: 12 },
});
