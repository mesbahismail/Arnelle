import { CaptureScreen } from "./src/capture-screen";
import { PhotoEffects } from "./src/photo-effects";
import { StoryViewer } from "./src/story-viewer";
import { natureDemoVideoSource } from "./src/playback";
import { Text, TextInput, useAppFonts } from "./src/typography";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  View,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaProvider,
  SafeAreaInsetsContext,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { EntryFlow, clearDemoSession } from "./src/entry-flow";
import { Reveal, FloatingHearts, LiveComment } from "./src/motion";
import { PreviewChrome } from "./src/preview-chrome";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { VideoView, useVideoPlayer } from "expo-video";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { useAudioPlayer } from "expo-audio";
import {
  colors,
  communities,
  creators,
  gifts,
  interests,
  photos,
  reels,
  tracks,
  type PhotoKey,
} from "./src/data";
import {
  Action,
  Avatar,
  Divider,
  Header,
  Icon,
  IconButton,
  Photo,
  SearchField,
  Section,
  Shade,
  Sheet,
  s,
  type IconName,
} from "./src/ui";
import { useDemoStore } from "./src/store";
import { demoVideoUrl, livePlaybackUrl } from "./src/services";
import { createDemoMelody, persistStoryPhoto } from "./src/media";
type Tab = "Discover" | "Browse" | "Communities" | "Messaging" | "Profile";
type Screen =
  | Tab
  | "Saved"
  | "Followers"
  | "Community"
  | "Chat"
  | "Camera"
  | "Story"
  | "Share";
type SheetName =
  | "menu"
  | "gift"
  | "music"
  | "edit"
  | "notifications"
  | "settings"
  | "help"
  | "select"
  | null;
const tabs: { title: Tab; icon: IconName }[] = [
  { title: "Discover", icon: "compass" },
  { title: "Browse", icon: "search" },
  { title: "Communities", icon: "people" },
  { title: "Messaging", icon: "chatbubbles" },
  { title: "Profile", icon: "person-circle" },
];
export default function App() {
  const [fontsLoaded, fontError] = useAppFonts();
  const app = (
    <>
      <StatusBar style="light" />
      {fontsLoaded || fontError ? (
        <RNL />
      ) : (
        <View style={{ flex: 1, backgroundColor: "#141416" }} />
      )}
      <PreviewChrome />
    </>
  );
  return (
    <SafeAreaProvider>
      {Platform.OS === "web" ? (
        <SafeAreaInsetsContext.Provider
          value={{ top: 59, bottom: 34, left: 0, right: 0 }}
        >
          {app}
        </SafeAreaInsetsContext.Provider>
      ) : (
        app
      )}
    </SafeAreaProvider>
  );
}
function RNL() {
  const { state, setState, update, toggle, ready, storageError } =
    useDemoStore();
  const [authenticated, setAuthenticated] = useState(false);
  const [screen, setScreen] = useState<Screen>("Discover");
  const [tab, setTab] = useState<Tab>("Discover");
  const [sheet, setSheet] = useState<SheetName>(null);
  const [step, setStep] = useState(0);
  const [search, setSearch] = useState("");
  const [queryTab, setQueryTab] = useState("Reels");
  const [activeReel, setActiveReel] = useState<(typeof reels)[number] | null>(
    null,
  );
  const [community, setCommunity] = useState(communities[0]);
  const [activeStory, setActiveStory] = useState<
    (typeof creators)[number] | null
  >(null);
  const [chat, setChat] = useState(creators[2]);
  const [draft, setDraft] = useState("");
  const [gift, setGift] = useState(1);
  const [giftsSent, setGiftsSent] = useState<string[]>([]);
  const [storyUri, setStoryUri] = useState(photos.hike);
  const [caption, setCaption] = useState("");
  const [audience, setAudience] = useState("Main stories");
  const [filter, setFilter] = useState("Default");
  const [track, setTrack] = useState("");
  const [audioStart, setAudioStart] = useState(0);
  const [musicSearch, setMusicSearch] = useState("");
  const [audioSelection, setAudioSelection] = useState(false);
  const [playingTrack, setPlayingTrack] = useState("");
  const [selector, setSelector] = useState<{
    title: string;
    options: string[];
    onSelect: (v: string) => void;
  }>({ title: "", options: [], onSelect: () => {} });
  const [editName, setEditName] = useState(state.name);
  const [editBio, setEditBio] = useState(state.bio);
  const [joinedOnly, setJoinedOnly] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatScroll = useRef<ScrollView>(null);
  const [demoAudio] = useState(createDemoMelody);
  const player = useAudioPlayer(demoAudio);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const cardWidth = (width - 32 - 8) / 2;
  const notice = (text: string) => {
    setToast(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3500);
  };
  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );
  useEffect(() => {
    if (storageError)
      notice("Storage is unavailable. Changes will last for this session.");
  }, [storageError]);
  const go = (t: Tab) => {
    setTab(t);
    setScreen(t);
    setSearch("");
    setSheet(null);
    setDraft("");
  };
  const closeSheet = () => {
    player.pause();
    setPlayingTrack("");
    setSheet(null);
  };
  const select = (
    title: string,
    options: string[],
    onSelect: (v: string) => void,
  ) => {
    setSelector({ title, options, onSelect });
    setSheet("select");
  };
  const openCamera = () => {
    setScreen("Camera");
    setFilter("Default");
    setCaption("");
    setTrack("");
    setAudioSelection(false);
  };
  const pickPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.85,
      });
      if (!result.canceled) {
        setStoryUri(result.assets[0].uri);
        setScreen("Story");
      }
    } catch {
      Alert.alert(
        "Photo access needed",
        "Enable photo access in iOS Settings to choose an image.",
      );
    }
  };
  const creatorRow = (c: (typeof creators)[number]) => (
    <View style={st.creatorRow} key={c.id}>
      <Avatar index={c.avatar} ring={c.avatar % 2 === 0} />
      <View style={{ flex: 1 }}>
        <Text style={st.creatorName}>{c.name}</Text>
        <Text style={[s.muted, { marginTop: 5 }]}>@{c.handle}</Text>
      </View>
      <Action outline onPress={() => toggle("following", c.id)}>
        <Icon
          name={state.following.includes(c.id) ? "checkmark" : "person-add"}
          size={16}
        />
        <Text style={s.small}>
          {state.following.includes(c.id) ? "Following" : "Follow"}
        </Text>
      </Action>
    </View>
  );
  const card = (r: (typeof reels)[number], compact = false) => (
    <Pressable
      key={r.id}
      accessibilityRole="button"
      accessibilityLabel={`${r.live ? "Live: " : ""}${r.title} by ${r.user}`}
      onPress={() => setActiveReel(r)}
      style={[
        st.reelCard,
        {
          width: compact ? cardWidth : 128,
          height: compact ? cardWidth * (240 / 176) : 190,
        },
      ]}
    >
      <Photo image={r.image} />
      <Shade />
      {r.live && (
        <View style={st.liveBadge}>
          <Text style={st.liveText}>LIVE</Text>
        </View>
      )}
      <View style={st.reelCopy}>
        <Text style={st.reelUser}>@{r.user}</Text>
        <View style={[s.row, { marginTop: 7 }]}>
          <Icon name="heart" size={13} />
          <Text style={st.reelStats}>{r.likes}</Text>
          <Icon name="chatbox" size={13} />
          <Text style={st.reelStats}>{r.comments}</Text>
        </View>
      </View>
    </Pressable>
  );
  const filteredReels = reels.filter((r) =>
    `${r.title} ${r.tag} ${r.user}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  if (!ready)
    return (
      <View style={[s.root, st.center]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  if (!authenticated)
    return (
      <EntryFlow
        onComplete={(session, newAccount, skip) => {
          if (newAccount) update({ handle: session.username, onboarded: skip });
          else update({ onboarded: true });
          setStep(0);
          setAuthenticated(true);
        }}
      />
    );
  return (
    <LinearGradient
      colors={
        screen === "Camera" ? ["#42482d", "#111511"] : ["#222222", "#111111"]
      }
      style={s.root}
    >
      <SafeAreaView
        style={[s.root, { backgroundColor: "transparent" }]}
        edges={["top"]}
      >
        <Reveal
          identity={`${screen}-${step}-${state.onboarded}`}
          style={{ flex: 1 }}
        >
          {!state.onboarded ? (
            <>
              <Header
                title="Get started"
                left="chevron-back"
                onLeft={() =>
                  step > 0 ? setStep(step - 1) : update({ onboarded: true })
                }
                right="help-circle-outline"
                onRight={() => setSheet("help")}
              />
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  padding: 20,
                  paddingBottom: step === 0 ? 62 : 50,
                  flexGrow: 1,
                }}
              >
                <Text
                  style={[
                    s.title,
                    {
                      textAlign: "center",
                      marginTop: 12,
                      marginBottom: step === 0 ? 0 : 12,
                    },
                  ]}
                >
                  {step === 0
                    ? "Tell us about you"
                    : step === 1
                      ? "Choose your interests"
                      : "Follow creators"}
                </Text>
                {step === 0 ? (
                  <>
                    <Divider first>BIRTHDAY</Divider>
                    <View style={[s.row, { gap: 12 }]}>
                      {state.birthday.map((v, i) => (
                        <Pressable
                          key={i}
                          style={[st.select, { flex: 1 }]}
                          onPress={() =>
                            select(
                              ["Day", "Month", "Year"][i],
                              i === 0
                                ? Array.from(
                                    { length: 31 },
                                    (_, j) => `${j + 1}`,
                                  )
                                : i === 1
                                  ? [
                                      "Jan",
                                      "Feb",
                                      "Mar",
                                      "Apr",
                                      "May",
                                      "Jun",
                                      "Jul",
                                      "Aug",
                                      "Sep",
                                      "Oct",
                                      "Nov",
                                      "Dec",
                                    ]
                                  : Array.from(
                                      { length: 90 },
                                      (_, j) => `${2010 - j}`,
                                    ),
                              (value) =>
                                update({
                                  birthday: state.birthday.map((b, j) =>
                                    j === i ? value : b,
                                  ),
                                }),
                            )
                          }
                        >
                          <Text style={s.text}>{v}</Text>
                          <Icon
                            name="chevron-down"
                            color={colors.muted}
                            size={16}
                          />
                        </Pressable>
                      ))}
                    </View>
                    <Divider>GENDER</Divider>
                    <View style={st.segmented}>
                      {["Male", "Female"].map((g) => (
                        <Pressable
                          key={g}
                          style={{ flex: 1 }}
                          onPress={() => update({ gender: g })}
                        >
                          {state.gender === g ? (
                            <LinearGradient
                              colors={colors.gradient}
                              style={st.segment}
                            >
                              <Text style={s.text}>{g}</Text>
                            </LinearGradient>
                          ) : (
                            <View style={st.segment}>
                              <Text style={s.text}>{g}</Text>
                            </View>
                          )}
                        </Pressable>
                      ))}
                    </View>
                    <Divider>NATIONALITY</Divider>
                    <Pressable
                      style={st.select}
                      onPress={() =>
                        select(
                          "Nationality",
                          [
                            "🇮🇹 Italian",
                            "🇲🇦 Moroccan",
                            "🇺🇸 American",
                            "🇬🇧 British",
                            "🇫🇷 French",
                            "🌍 Other",
                          ],
                          (v) => update({ nationality: v }),
                        )
                      }
                    >
                      <Text style={s.text}>{state.nationality}</Text>
                      <Icon
                        name="chevron-down"
                        color={colors.muted}
                        size={16}
                      />
                    </Pressable>
                    <Divider>LANGUAGE</Divider>
                    <Pressable
                      style={st.select}
                      onPress={() =>
                        select(
                          "Language",
                          [
                            "🇬🇧 English",
                            "🇫🇷 Français",
                            "🇮🇹 Italiano",
                            "🇲🇦 العربية",
                          ],
                          (v) => update({ language: v }),
                        )
                      }
                    >
                      <Text style={s.text}>{state.language}</Text>
                      <Icon
                        name="chevron-down"
                        color={colors.muted}
                        size={16}
                      />
                    </Pressable>
                  </>
                ) : step === 1 ? (
                  <>
                    <Text style={[s.muted, st.centerText]}>
                      The things you love help us find your kind of inspiration.
                    </Text>
                    <View style={st.chips}>
                      {interests.map((i) => (
                        <Pressable
                          key={i}
                          accessibilityRole="checkbox"
                          accessibilityState={{
                            checked: state.interests.includes(i),
                          }}
                          style={[
                            st.chip,
                            state.interests.includes(i) && st.chipSelected,
                          ]}
                          onPress={() => toggle("interests", i)}
                        >
                          <Text style={s.small}>{i}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </>
                ) : (
                  <>
                    <Text
                      style={[
                        s.muted,
                        st.centerText,
                        { fontSize: 14, lineHeight: 18, marginBottom: 24 },
                      ]}
                    >
                      Meet creators who inspire you. Follow a few favorites to
                      make your feed feel like you.
                    </Text>
                    {creators.map(creatorRow)}
                  </>
                )}
                <View style={{ flex: 1, minHeight: step === 2 ? 4 : 32 }} />
                <Action
                  onPress={() =>
                    step < 2 ? setStep(step + 1) : update({ onboarded: true })
                  }
                >
                  Next
                </Action>
                {step > 0 && (
                  <Pressable
                    style={st.skip}
                    onPress={() =>
                      step === 1 ? setStep(2) : update({ onboarded: true })
                    }
                  >
                    <Text style={s.text}>Skip →</Text>
                  </Pressable>
                )}
              </ScrollView>
            </>
          ) : (
            <>
              {screen !== "Camera" && (
                <Header
                  borderless={["Communities", "Messaging", "Browse"].includes(
                    screen,
                  )}
                  titleAccessory={
                    screen === "Chat" ? (
                      <Avatar index={chat.avatar} size={26} />
                    ) : screen === "Community" ? (
                      <Image
                        source={{ uri: photos[community.image] }}
                        style={{ width: 26, height: 26, borderRadius: 13 }}
                      />
                    ) : undefined
                  }
                  onTitlePress={
                    screen === "Chat" ? () => setActiveStory(chat) : undefined
                  }
                  title={
                    screen === "Community"
                      ? community.name
                      : screen === "Chat"
                        ? `@${chat.handle}`
                        : ["Story", "Share"].includes(screen)
                          ? "Add story"
                          : screen === "Followers"
                            ? "My followers"
                            : screen
                  }
                  left={
                    ["Community", "Chat", "Followers", "Saved"].includes(screen)
                      ? "chevron-back"
                      : ["Story", "Share"].includes(screen)
                        ? "close"
                        : screen === "Communities"
                          ? "add"
                          : "camera"
                  }
                  onLeft={() =>
                    ["Community", "Chat", "Followers", "Saved"].includes(screen)
                      ? setScreen(tab)
                      : ["Story", "Share"].includes(screen)
                        ? setScreen(tab)
                        : openCamera()
                  }
                  right={
                    screen === "Communities"
                      ? "filter"
                      : screen === "Profile"
                        ? "menu"
                        : ["Community", "Chat", "Story", "Share"].includes(
                              screen,
                            )
                          ? "ellipsis-vertical"
                          : "notifications"
                  }
                  onRight={() =>
                    screen === "Communities"
                      ? (setJoinedOnly((value) => !value),
                        notice(
                          joinedOnly
                            ? "Showing all communities"
                            : "Showing joined communities",
                        ))
                      : setSheet(
                          screen === "Profile"
                            ? "menu"
                            : ["Community", "Chat", "Story", "Share"].includes(
                                  screen,
                                )
                              ? "help"
                              : "notifications",
                        )
                  }
                />
              )}
              {screen === "Discover" && (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingVertical: 24,
                    paddingBottom: 110,
                  }}
                >
                  <View style={st.sectionPad}>
                    <Section title="What’s new" onMore={() => go("Browse")} />
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={st.horizontal}
                  >
                    {reels.slice(0, 3).map((r) => card(r))}
                  </ScrollView>
                  <View
                    testID="discover-divider"
                    style={{
                      height: StyleSheet.hairlineWidth,
                      backgroundColor: "#ffffff30",
                      alignSelf: "stretch",
                      marginVertical: 24,
                    }}
                  />
                  <View style={st.sectionPad}>
                    <Section
                      title="Creators to follow"
                      onMore={() => setScreen("Followers")}
                    />
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={st.horizontal}
                  >
                    {creators.map((c) => (
                      <Pressable
                        key={c.id}
                        onPress={() => toggle("following", c.id)}
                        accessibilityLabel={`${state.following.includes(c.id) ? "Unfollow" : "Follow"} ${c.name}`}
                        style={st.creatorTile}
                      >
                        <Avatar
                          index={c.avatar}
                          size={64}
                          ring={state.following.includes(c.id)}
                        />
                      </Pressable>
                    ))}
                  </ScrollView>
                  <View
                    testID="discover-divider"
                    style={{
                      height: StyleSheet.hairlineWidth,
                      backgroundColor: "#ffffff30",
                      alignSelf: "stretch",
                      marginVertical: 24,
                    }}
                  />
                  <View style={st.sectionPad}>
                    <Section
                      title="Communities"
                      onMore={() => go("Communities")}
                    />
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={st.horizontal}
                  >
                    {communities.map((c) => (
                      <Pressable
                        style={st.communityTile}
                        key={c.id}
                        onPress={() => {
                          setCommunity(c);
                          setTab("Communities");
                          setScreen("Community");
                        }}
                      >
                        <Photo image={c.image} />
                        <Shade />
                        <View style={st.reelCopy}>
                          <Text style={st.reelUser}>{c.short}</Text>
                          <View style={[s.row, { marginTop: 5 }]}>
                            <Icon name="people" size={13} />
                            <Text style={s.small}>{c.members}</Text>
                          </View>
                        </View>
                      </Pressable>
                    ))}
                  </ScrollView>
                </ScrollView>
              )}
              {(screen === "Browse" || screen === "Saved") && (
                <ScrollView
                  contentContainerStyle={[
                    s.content,
                    { paddingHorizontal: 16, paddingBottom: 110 },
                  ]}
                >
                  <SearchField
                    placeholder="Search for a reel…"
                    value={search}
                    onChangeText={setSearch}
                  />
                  {!!search && (
                    <View style={st.queryTabs}>
                      {["Reels", "Hashtags", "Accounts"].map((t) => (
                        <Pressable
                          key={t}
                          style={[
                            st.queryTab,
                            queryTab === t && st.queryActive,
                          ]}
                          onPress={() => setQueryTab(t)}
                        >
                          <Text style={s.text}>{t}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                  {search && queryTab === "Accounts" ? (
                    creators
                      .filter((c) => c.handle.includes(search.toLowerCase()))
                      .map(creatorRow)
                  ) : search && queryTab === "Hashtags" ? (
                    ["Art", "Nature", "Travel", "Music", "Lifestyle"]
                      .filter((t) =>
                        t.toLowerCase().includes(search.toLowerCase()),
                      )
                      .map((t) => (
                        <Pressable
                          key={t}
                          style={st.creatorRow}
                          onPress={() => {
                            setSearch(t);
                            setQueryTab("Reels");
                          }}
                        >
                          <Text style={s.title}>#</Text>
                          <Text style={s.text}>{t}</Text>
                        </Pressable>
                      ))
                  ) : (
                    <View style={st.grid}>
                      {filteredReels
                        .filter(
                          (r) =>
                            screen !== "Saved" || state.saved.includes(r.id),
                        )
                        .map((r) => card(r, true))}
                    </View>
                  )}
                  {(!filteredReels.length ||
                    (screen === "Saved" && !state.saved.length)) && (
                    <Text style={[s.muted, st.centerText]}>
                      No moments found. Try a new search or save a reel.
                    </Text>
                  )}
                </ScrollView>
              )}
              {screen === "Followers" && (
                <ScrollView
                  contentContainerStyle={[s.content, { paddingBottom: 110 }]}
                >
                  {creators.map(creatorRow)}
                </ScrollView>
              )}
              {screen === "Communities" && (
                <ScrollView
                  contentContainerStyle={[
                    s.content,
                    {
                      paddingHorizontal: 16,
                      paddingTop: 8,
                      paddingBottom: 110,
                    },
                  ]}
                >
                  <View
                    style={{
                      borderBottomWidth: 1,
                      borderColor: "#ffffff33",
                      marginHorizontal: -16,
                      paddingHorizontal: 16,
                      marginBottom: 20,
                    }}
                  >
                    <SearchField
                      placeholder={
                        joinedOnly
                          ? "Search joined communities…"
                          : "Search for a community…"
                      }
                      value={search}
                      onChangeText={setSearch}
                    />
                  </View>
                  {communities
                    .filter(
                      (c) =>
                        (!joinedOnly || state.joined.includes(c.id)) &&
                        c.name.toLowerCase().includes(search.toLowerCase()),
                    )
                    .map((c) => (
                      <View key={c.id} style={st.communityCard}>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Open ${c.name}`}
                          onPress={() => {
                            setCommunity(c);
                            setScreen("Community");
                          }}
                          style={StyleSheet.absoluteFill}
                        >
                          <Photo image={c.image} />
                          <Shade />
                        </Pressable>
                        <View
                          style={[s.row, { alignItems: "center", gap: 12 }]}
                        >
                          <Image
                            source={{ uri: photos[c.image] }}
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 22,
                              borderWidth: 1,
                              borderColor: "#ffffff55",
                            }}
                          />
                          <View style={{ flex: 1 }}>
                            <Text
                              style={[
                                s.text,
                                { fontWeight: "600", fontSize: 16 },
                              ]}
                            >
                              {c.name}
                            </Text>
                            <View style={[s.row, { gap: 4, marginTop: 6 }]}>
                              <Icon name="people" size={13} color="#ffffffa6" />
                              <Text
                                style={{
                                  color: "#ffffffa6",
                                  fontSize: 10,
                                  letterSpacing: 0.8,
                                }}
                              >
                                {c.members} MEMBERS
                              </Text>
                            </View>
                          </View>
                          <Action
                            outline
                            onPress={() => toggle("joined", c.id)}
                          >
                            <Icon
                              name={
                                state.joined.includes(c.id)
                                  ? "checkmark"
                                  : "add"
                              }
                              size={18}
                            />
                            <Text style={s.small}>
                              {state.joined.includes(c.id) ? "Joined" : "Join"}
                            </Text>
                          </Action>
                        </View>
                      </View>
                    ))}
                </ScrollView>
              )}
              {screen === "Community" && (
                <KeyboardAvoidingView
                  style={{ flex: 1 }}
                  behavior={Platform.OS === "ios" ? "padding" : undefined}
                >
                  <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
                    {[
                      ...(state.posts[community.id] || []),
                      "A reminder to make something just for the joy of making it. What are you working on today?",
                      "A little glimpse into my creative world. Falling in love with these colors again.",
                    ].map((p, i) => (
                      <View style={st.post} key={i}>
                        <View style={s.row}>
                          <Avatar index={i % 6} size={36} />
                          <View style={{ flex: 1 }}>
                            <Text style={s.text}>
                              @
                              {i < (state.posts[community.id]?.length || 0)
                                ? state.handle
                                : i % 2
                                  ? "mariam"
                                  : "jackyjones"}
                            </Text>
                            <Text style={s.muted}>2 min ago</Text>
                          </View>
                          <IconButton
                            name="ellipsis-vertical"
                            label="Post details"
                            onPress={() => notice("Community demo post")}
                            size={32}
                          />
                        </View>
                        <Text
                          style={[
                            s.text,
                            { lineHeight: 24, marginVertical: 20 },
                          ]}
                        >
                          {p}
                        </Text>
                        {i === (state.posts[community.id]?.length || 0) + 1 && (
                          <View
                            style={{
                              flexDirection: "row",
                              gap: 8,
                              height: 208,
                            }}
                          >
                            <Image
                              source={{ uri: photos[community.image] }}
                              style={{
                                flex: 1.5,
                                height: 208,
                                borderRadius: 10,
                              }}
                            />
                            <View style={{ flex: 1, gap: 8 }}>
                              <Image
                                source={{ uri: photos.art }}
                                style={{
                                  flex: 1,
                                  width: "100%",
                                  borderRadius: 10,
                                }}
                              />
                              <Image
                                source={{ uri: photos.pottery }}
                                style={{
                                  flex: 1,
                                  width: "100%",
                                  borderRadius: 10,
                                }}
                              />
                            </View>
                          </View>
                        )}
                        <View
                          style={[
                            s.row,
                            { justifyContent: "space-around", marginTop: 20 },
                          ]}
                        >
                          <Pressable
                            style={s.row}
                            onPress={() =>
                              toggle("liked", `post-${community.id}-${i}`)
                            }
                          >
                            <Icon
                              name="heart"
                              color={
                                state.liked.includes(
                                  `post-${community.id}-${i}`,
                                )
                                  ? colors.accent
                                  : colors.text
                              }
                            />
                            <Text style={s.text}>
                              {state.liked.includes(`post-${community.id}-${i}`)
                                ? "12.3k"
                                : "12.2k"}
                            </Text>
                          </Pressable>
                          <Pressable
                            style={s.row}
                            onPress={() => setDraft("@mariam ")}
                          >
                            <Icon name="chatbox" />
                            <Text style={s.text}>244</Text>
                          </Pressable>
                          <Pressable
                            style={s.row}
                            onPress={() =>
                              Share.share({
                                message: `Join ${community.name} on RNL.`,
                              })
                            }
                          >
                            <Icon name="arrow-redo" />
                            <Text style={s.text}>Share</Text>
                          </Pressable>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                  <BlurView
                    intensity={65}
                    tint="dark"
                    style={[
                      st.composer,
                      {
                        borderWidth: 1,
                        borderColor: "#ffffff55",
                        borderRadius: 32,
                        margin: 16,
                        marginBottom: insets.bottom + 12,
                        padding: 8,
                      },
                    ]}
                  >
                    <IconButton
                      name="camera"
                      label="Add community photo"
                      onPress={openCamera}
                      size={36}
                    />
                    <TextInput
                      value={draft}
                      onChangeText={setDraft}
                      style={st.composerInput}
                      placeholder="Add something…"
                      placeholderTextColor={colors.muted}
                    />
                    <IconButton
                      name="add"
                      label="Attach to community post"
                      onPress={() =>
                        setDraft((value) =>
                          value ? value : "Sharing a little inspiration ✨ ",
                        )
                      }
                      size={36}
                    />
                    <IconButton
                      gradient
                      name="send"
                      label="Publish post"
                      onPress={() => {
                        if (draft.trim()) {
                          setState((prev) => ({
                            ...prev,
                            posts: {
                              ...prev.posts,
                              [community.id]: [
                                draft.trim(),
                                ...(prev.posts[community.id] || []),
                              ],
                            },
                          }));
                          setDraft("");
                        }
                      }}
                    />
                  </BlurView>
                </KeyboardAvoidingView>
              )}
              {screen === "Messaging" && (
                <ScrollView
                  contentContainerStyle={[
                    s.content,
                    { paddingHorizontal: 16, paddingBottom: 110 },
                  ]}
                >
                  <SearchField
                    placeholder="Search for a chat…"
                    value={search}
                    onChangeText={setSearch}
                  />
                  {creators
                    .filter((c) => c.handle.includes(search.toLowerCase()))
                    .map((c, i) => (
                      <View key={c.id} style={st.conversation}>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`View story by ${c.handle}`}
                          onPress={() => setActiveStory(c)}
                        >
                          <Avatar
                            index={c.avatar}
                            size={48}
                            ring={c.avatar % 2 === 0}
                          />
                        </Pressable>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Chat with ${c.handle}`}
                          style={{
                            flex: 1,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                          }}
                          onPress={() => {
                            setChat(c);
                            setScreen("Chat");
                            setDraft("");
                          }}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={st.creatorName}>@{c.handle}</Text>
                            <Text
                              numberOfLines={1}
                              style={[
                                s.muted,
                                {
                                  marginTop: 8,
                                  color: i < 3 ? colors.accent : colors.muted,
                                },
                              ]}
                            >
                              {state.messages[c.id]?.at(-1)?.text ||
                                (i < 2
                                  ? "▶ Tap to view"
                                  : i === 2
                                    ? "2 new messages"
                                    : "That sounds like a plan!")}
                            </Text>
                          </View>
                          <Text style={{ fontSize: 9, color: colors.muted }}>
                            11M AGO
                          </Text>
                        </Pressable>
                      </View>
                    ))}
                </ScrollView>
              )}
              {screen === "Chat" && (
                <KeyboardAvoidingView
                  style={{ flex: 1 }}
                  behavior={Platform.OS === "ios" ? "padding" : undefined}
                >
                  <ScrollView
                    ref={chatScroll}
                    onContentSizeChange={() =>
                      chatScroll.current?.scrollToEnd({ animated: true })
                    }
                    contentContainerStyle={st.chatContent}
                  >
                    <Text style={[s.muted, st.centerText]}>TODAY, 12:20</Text>
                    {(
                      state.messages[chat.id] || [
                        {
                          text: "Hey! Have you seen the Art World community?",
                          own: false,
                        },
                        {
                          text: "Yes! So much inspiration in one place ✨",
                          own: true,
                        },
                        {
                          text: "We should make something together this weekend.",
                          own: false,
                        },
                      ]
                    ).map((m, i) => (
                      <View
                        key={i}
                        style={[st.message, m.own && st.ownMessage]}
                      >
                        <Text
                          style={[s.text, { fontSize: 14, lineHeight: 21 }]}
                        >
                          {m.text}
                        </Text>
                      </View>
                    ))}
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Open shared reel"
                      onPress={() => setActiveReel(reels[0])}
                      style={[
                        st.message,
                        st.ownMessage,
                        {
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 12,
                          padding: 10,
                        },
                      ]}
                    >
                      <Image
                        source={{ uri: photos[reels[0].image] }}
                        style={{ width: 52, height: 72, borderRadius: 10 }}
                      />
                      <View>
                        <Text style={[s.text, { marginBottom: 8 }]}>
                          A moment worth sharing
                        </Text>
                        <View style={s.row}>
                          <Icon name="play" size={18} />
                          <Text style={s.text}>Open video</Text>
                        </View>
                      </View>
                    </Pressable>
                  </ScrollView>
                  <View
                    style={[
                      st.composer,
                      { paddingBottom: Math.max(insets.bottom, 16) },
                    ]}
                  >
                    <TextInput
                      style={st.composerInput}
                      placeholder="Type a reply…"
                      placeholderTextColor={colors.muted}
                      value={draft}
                      onChangeText={setDraft}
                      multiline
                    />
                    <IconButton
                      gradient
                      name="send"
                      label="Send reply"
                      onPress={() => {
                        if (draft.trim()) {
                          const text = draft.trim();
                          setState((prev) => ({
                            ...prev,
                            messages: {
                              ...prev.messages,
                              [chat.id]: [
                                ...(prev.messages[chat.id] || [
                                  {
                                    text: "Hey! Nice to meet you 👋",
                                    own: false,
                                  },
                                ]),
                                { text, own: true },
                              ],
                            },
                          }));
                          setDraft("");
                        }
                      }}
                    />
                  </View>
                </KeyboardAvoidingView>
              )}
              {screen === "Profile" && (
                <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
                  <View style={st.profile}>
                    <Avatar index={2} size={64} ring />
                    <View style={{ flex: 1 }}>
                      <Text style={[s.title, { fontSize: 23 }]}>
                        {state.name}
                      </Text>
                      <Text
                        style={{
                          color: colors.accent,
                          marginTop: 7,
                          fontSize: 16,
                        }}
                      >
                        @{state.handle}
                      </Text>
                    </View>
                    <IconButton
                      name="pencil"
                      label="Edit profile"
                      size={34}
                      onPress={() => {
                        setEditName(state.name);
                        setEditBio(state.bio);
                        setSheet("edit");
                      }}
                    />
                  </View>
                  <Text
                    style={[
                      s.muted,
                      { paddingHorizontal: 23, marginBottom: 20 },
                    ]}
                  >
                    {state.bio}
                  </Text>
                  <View style={st.stats}>
                    {[
                      ["12k", "FOLLOWERS"],
                      [`${3000 + state.following.length}`, "FOLLOWING"],
                      [`${43 + state.stories.length}`, "REELS"],
                    ].map(([n, label]) => (
                      <Pressable
                        key={label}
                        onPress={() =>
                          label === "REELS"
                            ? notice("Your reels appear below")
                            : setScreen("Followers")
                        }
                        style={st.stat}
                      >
                        <Text
                          style={{
                            fontSize: 28,
                            fontWeight: "600",
                            color: colors.text,
                          }}
                        >
                          {n}
                        </Text>
                        <Text
                          style={{
                            fontSize: 10,
                            color: colors.muted,
                            marginTop: 5,
                          }}
                        >
                          {label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  <View
                    testID="profile-reels"
                    style={[st.grid, { padding: 16 }]}
                  >
                    {state.stories.map((story) => (
                      <Pressable
                        key={story.id}
                        style={[
                          st.reelCard,
                          { width: cardWidth, height: cardWidth * 1.4 },
                        ]}
                        onPress={() => {
                          setStoryUri(story.uri);
                          setCaption(story.caption);
                          setTrack(story.track);
                          setScreen("Story");
                        }}
                      >
                        <Image
                          source={{ uri: story.uri }}
                          style={StyleSheet.absoluteFillObject}
                        />
                        <Shade />
                        <View style={st.reelCopy}>
                          <Text style={s.text}>@{state.handle}</Text>
                          <Text style={s.small}>
                            {story.caption || "Your newest moment"}
                          </Text>
                        </View>
                      </Pressable>
                    ))}
                    {reels.slice(1, 7).map((r) => card(r, true))}
                  </View>
                </ScrollView>
              )}
              {screen === "Camera" && (
                <CaptureScreen
                  onClose={() => setScreen(tab)}
                  onPhoto={(uri) => {
                    setStoryUri(uri);
                    setScreen("Story");
                  }}
                  onLibrary={pickPhoto}
                  filter={filter}
                  onFilter={setFilter}
                />
              )}
              {screen === "Story" && (
                <View
                  style={[
                    s.content,
                    {
                      flex: 1,
                      padding: 10,
                      paddingBottom: Math.max(insets.bottom, 20),
                    },
                  ]}
                >
                  <View style={st.storyPreview}>
                    <PhotoEffects uri={storyUri} filter={filter} />
                    <Text style={st.storyCaption}>{caption}</Text>
                    {!!track && (
                      <Text style={st.trackBadge}>
                        ♫ {track} · {audioStart}s
                      </Text>
                    )}
                  </View>
                  {audioSelection ? (
                    <View style={{ padding: 20 }}>
                      <View
                        style={[
                          s.row,
                          { justifyContent: "space-between", marginBottom: 18 },
                        ]}
                      >
                        <Pressable onPress={() => setAudioSelection(false)}>
                          <Icon name="chevron-back" />
                        </Pressable>
                        <Text style={s.small}>
                          SELECT AUDIO · {audioStart}s–{audioStart + 15}s
                        </Text>
                        <Pressable onPress={() => setAudioSelection(false)}>
                          <Icon name="checkmark" />
                        </Pressable>
                      </View>
                      <View
                        accessible
                        accessibilityRole="adjustable"
                        accessibilityLabel="Audio start time"
                        accessibilityValue={{
                          min: 0,
                          max: 15,
                          now: audioStart,
                        }}
                        accessibilityActions={[
                          { name: "increment" },
                          { name: "decrement" },
                        ]}
                        onAccessibilityAction={(e) =>
                          setAudioStart((v) =>
                            Math.max(
                              0,
                              Math.min(
                                15,
                                v +
                                  (e.nativeEvent.actionName === "increment"
                                    ? 1
                                    : -1),
                              ),
                            ),
                          )
                        }
                        onStartShouldSetResponder={() => true}
                        onResponderMove={(e) =>
                          setAudioStart(
                            Math.min(
                              15,
                              Math.max(
                                0,
                                Math.round(
                                  (e.nativeEvent.locationX / (width - 60)) * 15,
                                ),
                              ),
                            ),
                          )
                        }
                        style={st.waveform}
                      >
                        {Array.from({ length: 38 }, (_, i) => (
                          <View
                            key={i}
                            style={{
                              width: 3,
                              height: 12 + ((i * 23) % 42),
                              borderRadius: 2,
                              backgroundColor:
                                i >= audioStart && i < audioStart + 20
                                  ? "#fff"
                                  : "#68686d",
                            }}
                          />
                        ))}
                      </View>
                    </View>
                  ) : (
                    <>
                      <TextInput
                        value={caption}
                        onChangeText={setCaption}
                        placeholder="Add a little something…"
                        placeholderTextColor={colors.muted}
                        style={[st.textInput, { margin: 10, minHeight: 40 }]}
                      />
                      <View style={st.storyToolbar}>
                        <IconButton
                          name="image-outline"
                          label="Change photo"
                          onPress={pickPhoto}
                        />
                        <IconButton
                          name="text"
                          label="Add text"
                          onPress={() =>
                            setCaption(caption ? "" : "A little adventure 🌲")
                          }
                        />
                        <IconButton
                          name="happy"
                          label="Add sticker"
                          onPress={() => setCaption((c) => c + " ✨")}
                        />
                        <IconButton
                          name="musical-note"
                          label="Add music"
                          onPress={() => setSheet("music")}
                        />
                        <IconButton
                          name="color-filter"
                          label="Change filter"
                          onPress={() =>
                            setFilter(
                              filter === "Golden" ? "Default" : "Golden",
                            )
                          }
                        />
                        <IconButton
                          gradient
                          name="send"
                          label="Continue to sharing"
                          size={48}
                          onPress={() => setScreen("Share")}
                        />
                      </View>
                    </>
                  )}
                </View>
              )}
              {screen === "Share" && (
                <ScrollView
                  contentContainerStyle={[
                    s.content,
                    { paddingBottom: Math.max(insets.bottom, 24) },
                  ]}
                >
                  <Image source={{ uri: storyUri }} style={st.sharePreview} />
                  <Text style={s.title}>Add story</Text>
                  {["Main stories", "Private stories"].map((a, i) => (
                    <Pressable
                      key={a}
                      style={st.audienceRow}
                      onPress={() => setAudience(a)}
                    >
                      <View style={st.audienceIcon}>
                        <Icon name={i === 0 ? "earth" : "lock-closed"} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.text, { fontSize: 18 }]}>{a}</Text>
                        <Text style={[s.muted, { marginTop: 5 }]}>
                          {i === 0 ? "Your followers" : "Your close friends"}
                        </Text>
                      </View>
                      <Icon
                        name={
                          audience === a
                            ? "checkmark-circle"
                            : "ellipse-outline"
                        }
                        color={audience === a ? colors.accent : colors.muted}
                        size={30}
                      />
                    </Pressable>
                  ))}
                  <Divider>SHARE WITH</Divider>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 20, paddingVertical: 8 }}
                  >
                    {creators.map((c) => (
                      <Pressable
                        key={c.id}
                        onPress={() => toggle("following", c.id)}
                        style={st.creatorTile}
                      >
                        <Avatar
                          index={c.avatar}
                          size={42}
                          ring={state.following.includes(c.id)}
                        />
                        <Text style={st.handle}>@{c.handle}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                  <Action
                    style={{ marginTop: 32 }}
                    onPress={async () => {
                      let permanentUri: string;
                      try {
                        permanentUri = await persistStoryPhoto(storyUri);
                      } catch {
                        notice(
                          "The photo could not be saved. Please try again.",
                        );
                        return;
                      }
                      setState((prev) => ({
                        ...prev,
                        stories: [
                          {
                            id: `story-${Date.now()}`,
                            uri: permanentUri,
                            caption,
                            audience,
                            track,
                            audioStart,
                            filter,
                          },
                          ...prev.stories,
                        ],
                      }));
                      go("Profile");
                      notice("Your story is published in the demo.");
                    }}
                  >
                    Publish
                  </Action>
                </ScrollView>
              )}
              {!["Chat", "Community", "Camera", "Story", "Share"].includes(
                screen,
              ) && (
                <BlurView
                  intensity={70}
                  tint="dark"
                  style={[
                    st.tabBar,
                    { paddingBottom: Math.max(insets.bottom, 16) },
                  ]}
                >
                  <LinearGradient
                    pointerEvents="none"
                    colors={["#ffffff08", "#17202122", "#080909b8"]}
                    locations={[0, 0.45, 1]}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <LinearGradient
                    pointerEvents="none"
                    colors={["#ef79561a", "#71528120", "#57989a20"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[StyleSheet.absoluteFillObject, { top: 40 }]}
                  />
                  {tabs.map((t) => (
                    <Pressable
                      key={t.title}
                      accessibilityRole="tab"
                      accessibilityLabel={t.title}
                      accessibilityState={{ selected: tab === t.title }}
                      onPress={() => go(t.title)}
                      style={st.tab}
                    >
                      {tab === t.title && <View style={st.activeTabLine} />}
                      <Icon
                        name={t.icon}
                        size={29}
                        color={tab === t.title ? colors.accent : "#89898d"}
                      />
                    </Pressable>
                  ))}
                </BlurView>
              )}
            </>
          )}
          <Modal
            visible={!!activeStory}
            animationType="fade"
            onRequestClose={() => setActiveStory(null)}
            statusBarTranslucent
          >
            {activeStory && (
              <StoryViewer
                creator={activeStory}
                onClose={() => setActiveStory(null)}
              />
            )}
          </Modal>
          <Sheet
            title={
              sheet === "select"
                ? selector.title
                : sheet === "menu"
                  ? "Menu"
                  : sheet === "gift"
                    ? "Send gift"
                    : sheet === "music"
                      ? "Add music"
                      : sheet === "edit"
                        ? "Edit profile"
                        : sheet === "settings"
                          ? "Settings"
                          : sheet === "help"
                            ? "Welcome to RNL"
                            : "Notifications"
            }
            visible={sheet !== null && sheet !== "gift"}
            onClose={closeSheet}
          >
            {sheet === "select" &&
              selector.options.map((o) => (
                <Pressable
                  key={o}
                  style={st.option}
                  onPress={() => {
                    selector.onSelect(o);
                    setSheet(null);
                  }}
                >
                  <Text style={s.text}>{o}</Text>
                  <Icon name="chevron-forward" size={18} />
                </Pressable>
              ))}
            {sheet === "menu" &&
              (
                [
                  [
                    "people",
                    "Communities",
                    () => go("Communities"),
                    state.joined.length,
                  ],
                  [
                    "archive",
                    "Stories",
                    () => {
                      setSheet(null);
                      go("Profile");
                    },
                    state.stories.length,
                  ],
                  [
                    "bookmark",
                    "Saved reels",
                    () => {
                      setScreen("Saved");
                      setSheet(null);
                    },
                    state.saved.length,
                  ],
                  ["settings", "Settings", () => setSheet("settings")],
                  ["help-circle", "Help & support", () => setSheet("help")],
                  [
                    "log-out",
                    "Logout",
                    () => {
                      clearDemoSession()
                        .then(() => {
                          setSheet(null);
                          setScreen("Discover");
                          setTab("Discover");
                          setAuthenticated(false);
                        })
                        .catch(() =>
                          notice(
                            "Could not clear the saved session. Please try again.",
                          ),
                        );
                    },
                  ],
                ] as [IconName, string, () => void, number?][]
              ).map(([icon, label, action, count]) => (
                <Pressable
                  key={label}
                  accessibilityRole="button"
                  accessibilityLabel={label}
                  style={st.menuRow}
                  onPress={action}
                >
                  <Icon name={icon} color={colors.accent} />
                  <Text style={[s.text, { flex: 1, fontSize: 18 }]}>
                    {label}
                  </Text>
                  {count !== undefined && (
                    <Text style={{ color: colors.accent }}>{count}</Text>
                  )}
                </Pressable>
              ))}
            {sheet === "settings" && (
              <>
                <View style={st.option}>
                  <Text style={s.text}>Private demo profile</Text>
                  <Switch
                    value={state.privateProfile}
                    onValueChange={(v) => update({ privateProfile: v })}
                    trackColor={{ true: colors.accent }}
                  />
                </View>
                <Pressable
                  style={st.option}
                  onPress={() => {
                    setStep(0);
                    update({ onboarded: false });
                    setSheet(null);
                  }}
                >
                  <Text style={s.text}>Personalize your profile</Text>
                  <Icon name="arrow-forward" />
                </Pressable>
                <Text style={[s.muted, { marginVertical: 24 }]}>
                  RNL 1.0 · Local demo{"\n"}Settings and social activity are
                  saved on this device.
                </Text>
              </>
            )}
            {sheet === "help" && (
              <>
                <Text style={[s.title, { marginBottom: 20 }]}>
                  Find your people.{"\n"}Share your world.
                </Text>
                <Text style={[s.muted, { marginBottom: 24 }]}>
                  RNL is a free React Native template. Discover creators, join
                  communities, make stories, and start conversations.{"\n\n"}
                  Follows, messages, posts, stories, and gifts run locally. Live
                  broadcasting, cloud uploads, remote messaging, and real gift
                  purchases require your own backend. No real money is used.
                </Text>
                <Action onPress={closeSheet}>Let’s explore</Action>
              </>
            )}
            {sheet === "notifications" && (
              <>
                {[
                  {
                    user: "brook",
                    text: "is live. Take the scenic route.",
                    index: 4,
                  },
                  { user: "talia", text: "started following you.", index: 0 },
                  { user: "mariam", text: "posted in Art World.", index: 2 },
                ].map((n, i) => (
                  <Pressable
                    style={st.creatorRow}
                    key={n.user}
                    onPress={() => {
                      setSheet(null);
                      if (i === 0) setActiveReel(reels[1]);
                      else if (i === 1) setScreen("Followers");
                      else {
                        setCommunity(communities[0]);
                        setScreen("Community");
                      }
                    }}
                  >
                    <Avatar index={n.index} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.text}>@{n.user}</Text>
                      <Text style={s.muted}>{n.text}</Text>
                    </View>
                  </Pressable>
                ))}
              </>
            )}
            {sheet === "edit" && (
              <>
                <Text style={s.muted}>Name</Text>
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
                  maxLength={40}
                  style={st.textInput}
                />
                <Text style={[s.muted, { marginTop: 16 }]}>Bio</Text>
                <TextInput
                  value={editBio}
                  onChangeText={setEditBio}
                  maxLength={160}
                  multiline
                  style={[st.textInput, { minHeight: 80 }]}
                />
                <Action
                  disabled={!editName.trim()}
                  style={{ marginTop: 24 }}
                  onPress={() => {
                    update({ name: editName.trim(), bio: editBio });
                    setSheet(null);
                    notice("Profile updated");
                  }}
                >
                  Save changes
                </Action>
              </>
            )}
            {sheet === "music" && (
              <>
                <SearchField
                  placeholder="Search for a song…"
                  value={musicSearch}
                  onChangeText={setMusicSearch}
                />
                <Text style={[s.muted, { marginBottom: 12 }]}>
                  Original demo melody included. Replace with licensed audio.
                </Text>
                {tracks
                  .filter((t) =>
                    t.title.toLowerCase().includes(musicSearch.toLowerCase()),
                  )
                  .map((t, i) => (
                    <View style={st.trackRow} key={t.title}>
                      <Image
                        source={{
                          uri: photos[
                            (
                              [
                                "music",
                                "city",
                                "art",
                                "lake",
                                "nara",
                                "nature",
                              ] as PhotoKey[]
                            )[i]
                          ],
                        }}
                        style={{ width: 44, height: 44, borderRadius: 25 }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={[s.text, { fontSize: 15 }]}>
                          {t.title}
                        </Text>
                        <Text
                          style={{
                            color: colors.muted,
                            fontSize: 10,
                            marginTop: 6,
                          }}
                        >
                          {t.artist}
                        </Text>
                      </View>
                      <IconButton
                        name={playingTrack === t.title ? "pause" : "play"}
                        size={32}
                        label={`Preview ${t.title}`}
                        onPress={() => {
                          if (playingTrack === t.title) {
                            player.pause();
                            setPlayingTrack("");
                          } else {
                            player.seekTo(0);
                            player.play();
                            setPlayingTrack(t.title);
                          }
                        }}
                      />
                      <IconButton
                        gradient
                        name="add"
                        size={34}
                        label={`Use ${t.title}`}
                        onPress={() => {
                          setTrack(t.title);
                          setAudioSelection(true);
                          closeSheet();
                        }}
                      />
                    </View>
                  ))}
              </>
            )}
          </Sheet>
          <Modal
            visible={activeReel !== null}
            animationType="slide"
            onRequestClose={() => setActiveReel(null)}
            statusBarTranslucent
          >
            {activeReel && (
              <ReelViewer
                reel={activeReel}
                following={state.following.includes(activeReel.user)}
                saved={state.saved.includes(activeReel.id)}
                liked={state.liked.includes(activeReel.id)}
                onFollow={() => toggle("following", activeReel.user)}
                onSave={() => toggle("saved", activeReel.id)}
                onLike={() => toggle("liked", activeReel.id)}
                onClose={() => setActiveReel(null)}
                onGift={() => setSheet("gift")}
                giftsSent={giftsSent}
              />
            )}
            <Sheet
              title="Send gift"
              visible={sheet === "gift"}
              onClose={() => setSheet(null)}
            >
              <View
                style={[
                  s.row,
                  { justifyContent: "space-between", marginBottom: 20 },
                ]}
              >
                <Text style={s.muted}>A little joy goes a long way.</Text>
                <Text style={s.text}>★ {state.points}</Text>
              </View>
              <View style={st.giftGrid}>
                {gifts.map((g, i) => (
                  <Pressable
                    key={g.name}
                    style={[st.gift, gift === i && { borderColor: "#aaa" }]}
                    onPress={() => setGift(i)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: gift === i }}
                  >
                    <Text style={{ fontSize: 40 }}>{g.emoji}</Text>
                    <Text style={[s.text, { marginTop: 8, fontSize: 14 }]}>
                      {g.name}
                    </Text>
                    <Text
                      style={{
                        color: colors.accent,
                        fontSize: 10,
                        marginTop: 7,
                      }}
                    >
                      {g.points} POINTS
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Action
                label="Confirm gift"
                disabled={state.points < gifts[gift].points}
                style={{ marginTop: 24 }}
                onPress={() => {
                  const g = gifts[gift];
                  if (state.points < g.points) return;
                  setState((prev) => ({
                    ...prev,
                    points: prev.points - g.points,
                  }));
                  setGiftsSent((prev) => [...prev, `${g.emoji} 1× ${g.name}`]);
                  setSheet(null);
                  Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success,
                  ).catch(() => {});
                }}
              >
                {state.points < gifts[gift].points
                  ? "Not enough demo points"
                  : "Send gift"}
              </Action>
              <Text
                style={[
                  s.muted,
                  st.centerText,
                  { fontSize: 10, marginTop: 12 },
                ]}
              >
                Demo credits · No real money
              </Text>
            </Sheet>
          </Modal>
          {toast && (
            <View
              accessibilityRole="alert"
              style={[st.toast, { bottom: insets.bottom + 70 }]}
            >
              <Icon name="checkmark-circle" color={colors.accent} size={18} />
              <Text style={[s.small, { flex: 1 }]}>{toast}</Text>
            </View>
          )}
        </Reveal>
      </SafeAreaView>
    </LinearGradient>
  );
}
function ReelViewer({
  reel,
  following,
  saved,
  liked,
  onFollow,
  onSave,
  onLike,
  onClose,
  onGift,
  giftsSent,
}: {
  reel: (typeof reels)[number];
  following: boolean;
  saved: boolean;
  liked: boolean;
  onFollow: () => void;
  onSave: () => void;
  onLike: () => void;
  onClose: () => void;
  onGift: () => void;
  giftsSent: string[];
}) {
  const player = useVideoPlayer(
    reel.live ? livePlaybackUrl || natureDemoVideoSource : demoVideoUrl,
    (p) => {
      p.loop = true;
      p.muted = true;
      p.play();
    },
  );
  const [draft, setDraft] = useState("");
  const [error, setError] = useState(false);
  const [heartBurst, setHeartBurst] = useState(0);
  useEffect(() => {
    const sub = player.addListener("statusChange", ({ status }) =>
      setError(status === "error"),
    );
    return () => sub.remove();
  }, [player]);
  const [comments, setComments] = useState([
    { id: "initial-1", user: "anhild", text: "Can’t wait to join you" },
    { id: "initial-2", user: "nara", text: "Too beautiful to describe!! 😍" },
    { id: "initial-3", user: "brinhildr", text: "Amazing view!" },
  ]);
  useEffect(() => {
    const incoming = [
      { user: "sara", text: "A little moment of peace 🌿" },
      { user: "talia", text: "Nature never stops surprising me" },
      { user: "daria", text: "That little bee! 🐝" },
      { user: "mariam", text: "The colors are beautiful 🌸" },
      { user: "nara", text: "Could watch this all day 💛" },
      { user: "brookfan", text: "Thanks for sharing this moment!" },
    ];
    let index = 0;
    let foreground =
      AppState.currentState !== "background" &&
      AppState.currentState !== "inactive";
    const subscription = AppState.addEventListener("change", (next) => {
      foreground = next === "active";
      if (foreground) player.play();
      else player.pause();
    });
    const timer = reel.live
      ? setInterval(() => {
          if (!foreground) return;
          const comment = incoming[index % incoming.length];
          setComments((previous) => [
            ...previous.slice(-3),
            { ...comment, id: `incoming-${index++}-${Date.now()}` },
          ]);
          setHeartBurst((value) => value + 1);
        }, 1700)
      : null;
    return () => {
      if (timer) clearInterval(timer);
      subscription.remove();
    };
  }, [reel.live, player]);
  return (
    <View style={s.root}>
      <StatusBar style="light" />
      <Image
        source={{ uri: photos[reel.image] }}
        style={StyleSheet.absoluteFillObject}
      />
      {!error && (
        <VideoView
          player={player}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          nativeControls={!reel.live}
        />
      )}
      <LinearGradient
        pointerEvents="none"
        colors={["#000b", "#0000", "#0000", "#000d"]}
        locations={[0, 0.28, 0.58, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={[s.row, { padding: 16 }]}>
          <Avatar
            index={creators.find((c) => c.id === reel.user)?.avatar || 0}
            size={44}
          />
          <View style={{ flex: 1 }}>
            <View style={s.row}>
              <Text style={[s.text, { fontWeight: "600" }]}>@{reel.user}</Text>
              {reel.live && (
                <View
                  style={[
                    st.liveBadge,
                    { position: "relative", top: 0, left: 0 },
                  ]}
                >
                  <Text style={st.liveText}>LIVE</Text>
                </View>
              )}
            </View>
            <Text style={{ fontSize: 11, color: "#ffffff99", marginTop: 5 }}>
              {reel.live && !livePlaybackUrl ? "Demo live room" : reel.title}
            </Text>
          </View>
          <Action outline onPress={onFollow}>
            <Text style={s.small}>{following ? "Following" : "+ Follow"}</Text>
          </Action>
          <IconButton
            name="close"
            label="Close reel"
            onPress={onClose}
            size={34}
          />
        </View>
        <View style={{ flex: 1 }} />
        <View style={{ position: "absolute", right: 20, top: 145, gap: 16 }}>
          {giftsSent.map((g, i) => (
            <Text key={i} style={s.text}>
              {g}
            </Text>
          ))}
        </View>
        {reel.live && (
          <View style={{ padding: 16, gap: 9, alignItems: "flex-start" }}>
            {comments.slice(-4).map((c) => (
              <LiveComment key={c.id} style={st.liveComment}>
                <Text style={[s.text, { fontWeight: "600" }]}>@{c.user}</Text>
                <Text style={[s.text, { marginTop: 6, fontSize: 14 }]}>
                  {c.text}
                </Text>
              </LiveComment>
            ))}
          </View>
        )}
        <FloatingHearts burst={heartBurst} />
        <View style={[s.row, { padding: 16 }]}>
          {reel.live ? (
            <>
              <TextInput
                accessibilityLabel="Live comment"
                value={draft}
                onChangeText={setDraft}
                onSubmitEditing={() => {
                  if (draft.trim()) {
                    setComments((p) => [
                      ...p.slice(-3),
                      {
                        id: `you-${Date.now()}`,
                        user: "you",
                        text: draft.trim(),
                      },
                    ]);
                    setDraft("");
                  }
                }}
                placeholder="Type something…"
                placeholderTextColor="#ffffff99"
                style={[
                  st.textInput,
                  {
                    flex: 1,
                    backgroundColor: "#ffffff0d",
                    borderColor: "#ffffff66",
                    marginTop: 0,
                    borderRadius: 30,
                  },
                ]}
              />
              <IconButton
                name="gift-outline"
                label="Send gift"
                onPress={onGift}
              />
              <IconButton
                gradient
                name={draft.trim() ? "send" : "heart"}
                size={48}
                label={draft.trim() ? "Send comment" : "Like live stream"}
                onPress={() => {
                  if (draft.trim()) {
                    setComments((p) => [
                      ...p.slice(-3),
                      {
                        id: `you-${Date.now()}`,
                        user: "you",
                        text: draft.trim(),
                      },
                    ]);
                    setDraft("");
                  } else {
                    onLike();
                    setHeartBurst((value) => value + 1);
                  }
                }}
              />
            </>
          ) : (
            <>
              <IconButton
                name={liked ? "heart" : "heart-outline"}
                label="Like reel"
                onPress={onLike}
              />
              <Text style={s.small}>{liked ? "12.3k" : reel.likes}</Text>
              <View style={{ flex: 1 }} />
              <IconButton
                name={saved ? "bookmark" : "bookmark-outline"}
                label={saved ? "Unsave reel" : "Save reel"}
                onPress={onSave}
              />
              <IconButton
                name="share-social"
                label="Share reel"
                onPress={() =>
                  Share.share({
                    message: `${reel.title} by @${reel.user} — RNL`,
                  })
                }
              />
            </>
          )}
        </View>
      </SafeAreaView>
      <PreviewChrome />
    </View>
  );
}
const st = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  centerText: { textAlign: "center" },
  sectionPad: { paddingHorizontal: 20 },
  horizontal: { paddingHorizontal: 16, gap: 12 },
  reelCard: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  reelCopy: { position: "absolute", bottom: 16, left: 13, right: 10 },
  reelUser: { fontSize: 17, fontWeight: "600", color: colors.text },
  reelStats: { fontSize: 11, color: "#fff" },
  liveBadge: {
    position: "absolute",
    left: 12,
    top: 12,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#ff6262",
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: "#0002",
  },
  liveText: { fontSize: 10, color: "#fff", fontWeight: "600" },
  creatorTile: { alignItems: "center", gap: 8 },
  handle: { color: "#b4b4bb", fontSize: 10 },
  followText: { fontSize: 10, color: colors.accent },
  creatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#3e3e41",
  },
  creatorName: { fontSize: 16, fontWeight: "600", color: colors.text },
  communityTile: {
    width: 108,
    height: 112,
    borderRadius: 14,
    overflow: "hidden",
  },
  communityCard: {
    height: 164,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 12,
    padding: 16,
    justifyContent: "flex-end",
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  queryTabs: {
    flexDirection: "row",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  queryTab: { flex: 1, alignItems: "center", paddingVertical: 15 },
  queryActive: { borderBottomWidth: 2, borderBottomColor: colors.accent },
  tabBar: {
    height: 108,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderColor: "#5b5b61",
    borderTopLeftRadius: 23,
    borderTopRightRadius: 23,
    overflow: "hidden",
    flexDirection: "row",
    paddingTop: 24,
    backgroundColor: "#20242466",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 8,
    position: "relative",
  },
  activeTabLine: {
    position: "absolute",
    top: -24,
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: colors.accent,
  },
  select: {
    minHeight: 44,
    borderWidth: 1.5,
    borderColor: "#47474b",
    borderRadius: 30,
    backgroundColor: "#101012",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  segmented: {
    flexDirection: "row",
    borderWidth: 1.5,
    borderColor: "#47474b",
    borderRadius: 30,
    padding: 3,
    backgroundColor: "#101012",
  },
  segment: {
    height: 38,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
    marginTop: 28,
  },
  chip: {
    borderWidth: 1.5,
    borderColor: "#46464a",
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 30,
    backgroundColor: "#151517",
  },
  chipSelected: { borderColor: colors.accent, backgroundColor: "#5f342966" },
  skip: { padding: 18, alignItems: "center" },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 22,
    gap: 16,
    borderBottomWidth: 1,
    borderColor: "#45454a",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#66666d",
    borderRadius: 12,
    padding: 13,
    minHeight: 44,
    color: colors.text,
    backgroundColor: "#171719",
    marginTop: 8,
  },
  profile: { padding: 23, flexDirection: "row", alignItems: "center", gap: 14 },
  stats: {
    flexDirection: "row",
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  stat: { flex: 1, alignItems: "center" },
  conversation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderColor: "#505054",
  },
  chatContent: { padding: 23, gap: 16 },
  message: {
    padding: 15,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#444449",
    backgroundColor: "#252528",
    alignSelf: "flex-start",
    maxWidth: "86%",
  },
  ownMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#985439",
    borderColor: colors.accent,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 4,
  },
  composer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#54545a",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#232326",
  },
  composerInput: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    maxHeight: 90,
    padding: 8,
  },
  post: { padding: 23, borderBottomWidth: 1, borderColor: "#55555a" },
  postImage: { height: 270, width: "100%", borderRadius: 14 },
  cameraControls: {
    position: "absolute",
    bottom: 35,
    left: 28,
    right: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  enableCamera: {
    position: "absolute",
    top: 24,
    left: 40,
    right: 40,
    alignItems: "center",
    zIndex: 2,
  },
  storyPreview: {
    flex: 1,
    minHeight: 250,
    borderRadius: 16,
    overflow: "hidden",
  },
  storyCaption: {
    position: "absolute",
    bottom: 75,
    left: 20,
    right: 20,
    textAlign: "center",
    fontSize: 25,
    color: "#fff",
    fontWeight: "600",
    textShadowColor: "#000a",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  trackBadge: {
    position: "absolute",
    left: 15,
    bottom: 15,
    borderRadius: 20,
    backgroundColor: "#ffffff0d",
    borderColor: "#ffffff66",
    padding: 9,
    color: "#fff",
    fontSize: 12,
  },
  storyToolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    paddingTop: 12,
    gap: 6,
  },
  sharePreview: {
    width: 155,
    height: 250,
    borderRadius: 15,
    alignSelf: "center",
    marginBottom: 32,
  },
  audienceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 22,
    borderBottomWidth: 1,
    borderColor: "#5d5d61",
  },
  audienceIcon: {
    height: 44,
    width: 44,
    borderRadius: 25,
    backgroundColor: "#ffffff18",
    alignItems: "center",
    justifyContent: "center",
  },
  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
  },
  waveform: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: 12,
    padding: 8,
    height: 66,
  },
  giftGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
  },
  gift: {
    width: "31%",
    alignItems: "center",
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: 12,
  },
  liveComment: {
    backgroundColor: "#ffffff12",
    borderWidth: 1,
    borderColor: "#ffffff4d",
    borderRadius: 14,
    borderBottomLeftRadius: 4,
    padding: 12,
  },
  toast: {
    position: "absolute",
    left: 23,
    right: 23,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#5b5149",
    backgroundColor: "#2c2622f5",
    flexDirection: "row",
    gap: 10,
    padding: 15,
    alignItems: "center",
  },
});
