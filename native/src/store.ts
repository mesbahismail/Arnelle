import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
export type Message = { text: string; own: boolean };
export type Story = {
  id: string;
  uri: string;
  caption: string;
  audience: string;
  track: string;
  audioStart: number;
  filter: string;
};
export type DemoState = {
  onboarded: boolean;
  name: string;
  handle: string;
  bio: string;
  following: string[];
  joined: string[];
  saved: string[];
  liked: string[];
  points: number;
  interests: string[];
  birthday: string[];
  gender: string;
  nationality: string;
  language: string;
  messages: Record<string, Message[]>;
  stories: Story[];
  posts: Record<string, string[]>;
  privateProfile: boolean;
};
export const initialState: DemoState = {
  onboarded: false,
  name: "Arnelle Williams",
  handle: "arnellewill",
  bio: "Finding inspiration in the everyday. ✨",
  following: ["brook"],
  joined: ["art"],
  saved: ["r2", "r4", "r5", "r6"],
  liked: [],
  points: 388,
  interests: ["✈️ Traveling", "🎨 Photography", "🌱 Gardening"],
  birthday: ["6", "Sep", "1996"],
  gender: "Male",
  nationality: "🇮🇹 Italian",
  language: "🇬🇧 English",
  messages: {},
  stories: [],
  posts: {},
  privateProfile: false,
};
const key = "@rnl/demo/v1";
export function useDemoStore() {
  const [state, setState] = useState<DemoState>(initialState);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem(key)
      .then((raw) => {
        if (raw) setState({ ...initialState, ...JSON.parse(raw) });
      })
      .catch(() => setStorageError(true))
      .finally(() => setReady(true));
  }, []);
  useEffect(() => {
    if (ready)
      AsyncStorage.setItem(key, JSON.stringify(state)).catch(() =>
        setStorageError(true),
      );
  }, [state, ready]);
  const update = (patch: Partial<DemoState>) =>
    setState((s) => ({ ...s, ...patch }));
  const toggle = (
    field: "following" | "joined" | "saved" | "liked" | "interests",
    id: string,
  ) =>
    setState((s) => ({
      ...s,
      [field]: s[field].includes(id)
        ? s[field].filter((x) => x !== id)
        : [...s[field], id],
    }));
  return { state, setState, update, toggle, ready, storageError };
}
