import { Text, TextInput } from "./typography";
import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  View,
  type TextInputProps,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { WelcomeIntro } from "./welcome-intro";
import { Action, Divider, Header, Icon, Sheet, type IconName } from "./ui";
import { Reveal, SpringPressable } from "./motion";
import { colors } from "./data";
import { EntryBackground } from "./entry-background";

const sessionKey = "@rnl/demo-session/v1";
export type DemoSession = { username: string; demo: true };
export async function clearDemoSession() {
  await AsyncStorage.removeItem(sessionKey);
}
type Route = "splash" | "welcome" | "login" | "signup" | "forgot" | "intro";
type EntryProps = {
  onComplete: (
    session: DemoSession,
    newAccount: boolean,
    skip: boolean,
  ) => void;
};

export function EntryFlow({ onComplete }: EntryProps) {
  const [route, setRoute] = useState<Route>("splash");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [newAccount, setNewAccount] = useState(false);
  const session = useRef<DemoSession>({ username: "arnelle", demo: true });
  const submitting = useRef(false);
  const insets = useSafeAreaInsets();
  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      try {
        const raw = await AsyncStorage.getItem(sessionKey);
        const saved = raw ? JSON.parse(raw) : null;
        if (
          active &&
          saved?.demo === true &&
          typeof saved.username === "string"
        ) {
          onComplete(saved, false, false);
          return;
        }
      } catch {
        /* A corrupt or unavailable cache safely returns to welcome. */
      }
      if (active) setRoute("welcome");
    }, 1200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
    // The startup check runs once; callbacks after navigation must not restart it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  function navigate(next: Route) {
    setError("");
    setPassword("");
    setRepeat("");
    setRoute(next);
  }
  async function complete(skip = false, account = newAccount) {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      if (remember)
        await AsyncStorage.setItem(sessionKey, JSON.stringify(session.current));
      else await clearDemoSession();
    } catch {
      setError(
        "Device storage is unavailable. Turn off Stay logged in to continue.",
      );
      if (remember) {
        submitting.current = false;
        setBusy(false);
        return;
      }
    }
    onComplete(session.current, account, skip);
    submitting.current = false;
    setBusy(false);
  }
  function login() {
    if (!username.trim() || !password) {
      setError("Enter your username and password.");
      return;
    }
    if (
      username.trim().toLowerCase() !== "arnelle" ||
      password !== "demo1234"
    ) {
      setError("For this template, use arnelle and demo1234.");
      return;
    }
    session.current = { username: "arnelle", demo: true };
    setPassword("");
    void complete(false, false);
  }
  function signup() {
    if (!/^[a-zA-Z0-9_]{3,24}$/.test(username.trim())) {
      setError("Use 3–24 letters, numbers, or underscores for your username.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }
    if (password !== repeat) {
      setError("Your passwords don’t match.");
      return;
    }
    session.current = { username: username.trim(), demo: true };
    setNewAccount(true);
    navigate("intro");
  }
  const social = (name: string, full = false) => (
    <Action
      outline
      disabled={busy}
      onPress={() => {
        session.current = { username: "arnelle", demo: true };
        void complete(true, false);
      }}
      style={a.social}
      label={`${full ? "Login with " : ""}${name}`}
    >
      <View style={a.buttonRow}>
        <Icon
          name={name === "Facebook" ? "logo-facebook" : "logo-google"}
          size={21}
        />
        <Text style={a.buttonText}>
          {full ? "Login with " : ""}
          {name}
        </Text>
      </View>
    </Action>
  );
  const field = (
    placeholder: string,
    icon: IconName,
    value: string,
    onChangeText: (text: string) => void,
    extra: TextInputProps = {},
  ) => (
    <View style={a.field}>
      <Icon name={icon} size={18} color="#aaa" />
      <TextInput
        accessibilityLabel={placeholder}
        placeholder={placeholder}
        placeholderTextColor="#aaa"
        value={value}
        onChangeText={(text) => {
          onChangeText(text);
          setError("");
        }}
        style={a.input}
        autoCapitalize="none"
        autoCorrect={false}
        {...extra}
      />
    </View>
  );
  const welcome = route === "splash" || route === "welcome";
  return (
    <LinearGradient colors={["#272828", "#111212"]} style={{ flex: 1 }}>
      <EntryBackground blurred={!welcome} />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <Reveal identity={route} style={{ flex: 1 }} animate={!welcome}>
          {!welcome && (
            <Header
              title={
                route === "signup"
                  ? "Sign up"
                  : route === "intro"
                    ? "Get started"
                    : route === "forgot"
                      ? "Reset password"
                      : "Login"
              }
              left="chevron-back"
              onLeft={() =>
                navigate(
                  route === "forgot"
                    ? "login"
                    : route === "intro"
                      ? "signup"
                      : "welcome",
                )
              }
              right="help-circle-outline"
              onRight={() =>
                setInfo(
                  "Explore Arnelle with the demo login: arnelle / demo1234. Sign up previews account setup locally. Connect an authentication provider before using real accounts.",
                )
              }
            />
          )}
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <ScrollView
              scrollEnabled={route !== "splash"}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={[
                a.body,
                { paddingBottom: insets.bottom + 24 },
                welcome && { paddingTop: 48 },
              ]}
            >
              {welcome ? (
                <WelcomeIntro loading={route === "splash"}>
                  <Action onPress={() => navigate("login")}>Login</Action>
                  {social("Facebook", true)}
                  {social("Google", true)}
                  <View>
                    <Divider style={{ marginTop: 16, marginBottom: 16 }}>
                      OR
                    </Divider>
                    <Action
                      outline
                      onPress={() => navigate("signup")}
                      label="Create account"
                    >
                      <View style={a.buttonRow}>
                        <Icon name="person-add" size={19} />
                        <Text style={a.buttonText}>Create account</Text>
                      </View>
                    </Action>
                  </View>
                </WelcomeIntro>
              ) : route === "intro" ? (
                <>
                  <View style={a.introCenter}>
                    <LinearGradient colors={colors.gradient} style={a.bulbRing}>
                      <View style={a.bulbInner}>
                        <Icon
                          name="bulb-outline"
                          size={58}
                          color={colors.accent}
                        />
                      </View>
                    </LinearGradient>
                    <Text
                      style={[a.title, { marginTop: 36, marginBottom: 12 }]}
                    >
                      Let’s setup your account
                    </Text>
                    <Text style={a.description}>
                      A little about you. A few things you love.{`\n`}Find the
                      people who make it feel like home.
                    </Text>
                    <View style={a.dots}>
                      {[0, 1, 2, 3].map((i) => (
                        <View
                          key={i}
                          style={[
                            a.dot,
                            i === 0 && {
                              backgroundColor: "#fff",
                              borderColor: "#fff",
                            },
                          ]}
                        />
                      ))}
                    </View>
                  </View>
                  <Action disabled={busy} onPress={() => void complete()}>
                    Get started
                  </Action>
                  <Action
                    outline
                    disabled={busy}
                    style={{ marginTop: 12 }}
                    onPress={() => void complete(true)}
                  >
                    Skip →
                  </Action>
                </>
              ) : (
                <>
                  <Text style={a.title}>
                    {route === "login"
                      ? "Welcome back"
                      : route === "signup"
                        ? "Create your account"
                        : "Forgot your password?"}
                  </Text>
                  {route === "forgot" ? (
                    <>
                      <Text style={[a.description, { marginBottom: 32 }]}>
                        Enter the email linked to your account.
                      </Text>
                      {field("Email", "mail", email, setEmail, {
                        keyboardType: "email-address",
                        autoComplete: "email",
                      })}
                      <Action
                        style={{ marginTop: 16 }}
                        onPress={() => {
                          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
                            setError("Enter a valid email address.");
                          else {
                            setError("");
                            setInfo(
                              "Reset flow preview complete. This template has no email service, so no reset email was sent. Use arnelle / demo1234 to explore.",
                            );
                          }
                        }}
                      >
                        Send reset link
                      </Action>
                      <Action
                        outline
                        style={{ marginTop: 16 }}
                        onPress={() => navigate("login")}
                      >
                        Back to login
                      </Action>
                    </>
                  ) : (
                    <>
                      {field(
                        "Username",
                        "person-circle",
                        username,
                        setUsername,
                        { autoComplete: "username", returnKeyType: "next" },
                      )}
                      {route === "signup" &&
                        field("Email", "mail", email, setEmail, {
                          keyboardType: "email-address",
                          autoComplete: "email",
                        })}
                      {field("Password", "lock-closed", password, setPassword, {
                        secureTextEntry: true,
                        autoComplete: "off",
                        onSubmitEditing: route === "login" ? login : undefined,
                      })}
                      {route === "signup" &&
                        field(
                          "Repeat password",
                          "lock-closed",
                          repeat,
                          setRepeat,
                          {
                            secureTextEntry: true,
                            autoComplete: "off",
                            onSubmitEditing: signup,
                          },
                        )}
                      {route === "login" && (
                        <View style={a.loginOptions}>
                          <View style={a.buttonRow}>
                            <Switch
                              accessibilityLabel="Stay logged in"
                              value={remember}
                              onValueChange={setRemember}
                              thumbColor={
                                remember ? colors.accentLight : "#f4f4f4"
                              }
                              trackColor={{
                                false: "#666",
                                true: colors.accent,
                              }}
                              style={{ transform: [{ scale: 0.8 }] }}
                            />
                            <Text style={a.small}>Stay logged in</Text>
                          </View>
                          <SpringPressable
                            accessibilityRole="button"
                            onPress={() => navigate("forgot")}
                          >
                            <Text style={[a.small, a.link]}>
                              Forgot password?
                            </Text>
                          </SpringPressable>
                        </View>
                      )}
                      {!!error && (
                        <Text accessibilityRole="alert" style={a.error}>
                          {error}
                        </Text>
                      )}
                      <Action
                        disabled={busy}
                        style={{ marginTop: route === "signup" ? 12 : 16 }}
                        onPress={route === "login" ? login : signup}
                      >
                        {busy
                          ? "Opening…"
                          : route === "login"
                            ? "Login"
                            : "Create account"}
                      </Action>
                      {route === "signup" ? (
                        <>
                          <Text style={[a.description, { marginTop: 24 }]}>
                            By creating an account you agree to
                          </Text>
                          <SpringPressable
                            accessibilityRole="button"
                            onPress={() =>
                              setInfo(
                                "Arnelle is a free MIT-licensed demo template. Accounts, messages, posts, and gift credits stay local. No email is sent and no password is stored. Replace these demo terms with your own terms before launching a service.",
                              )
                            }
                          >
                            <Text style={[a.description, a.link]}>
                              all terms of use
                            </Text>
                          </SpringPressable>
                          <Divider>OR</Divider>
                          <Action outline onPress={() => navigate("login")}>
                            Login
                          </Action>
                          <Text style={a.demoNote}>
                            Local demo account · Use sample details
                          </Text>
                        </>
                      ) : (
                        <>
                          <Text style={a.demoNote}>
                            Template demo · arnelle / demo1234
                          </Text>
                          <Divider style={{ marginTop: 24, marginBottom: 4 }}>
                            CREATE ACCOUNT
                          </Divider>
                          {social("Facebook")}
                          {social("Google")}
                          <Action
                            outline
                            style={a.social}
                            onPress={() => navigate("signup")}
                            label="Email or number"
                          >
                            <View style={a.buttonRow}>
                              <Icon name="mail" size={20} />
                              <Text style={a.buttonText}>Email or number</Text>
                            </View>
                          </Action>
                        </>
                      )}
                    </>
                  )}
                  {route === "forgot" && !!error && (
                    <Text accessibilityRole="alert" style={a.error}>
                      {error}
                    </Text>
                  )}
                </>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </Reveal>
      </SafeAreaView>
      <Sheet visible={!!info} title="Good to know" onClose={() => setInfo("")}>
        <Text style={[a.description, { textAlign: "left", marginBottom: 24 }]}>
          {info}
        </Text>
        <Action onPress={() => setInfo("")}>Got it</Action>
      </Sheet>
    </LinearGradient>
  );
}
const a = StyleSheet.create({
  body: { flexGrow: 1, paddingHorizontal: 20 },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "500",
    lineHeight: 34,
    textAlign: "center",
    marginTop: 62,
    marginBottom: 40,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 42,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: "#888",
    backgroundColor: "#080a0a66",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    color: "#fff",
    minHeight: 40,
    fontSize: 15,
    paddingVertical: 8,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  social: { marginTop: 12 },
  loginOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  small: { color: "#eee", fontSize: 13 },
  link: { textDecorationLine: "underline" },
  description: {
    color: "#b3b3b3",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  error: {
    color: "#ffac97",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 8,
  },
  demoNote: { color: "#aaa", fontSize: 11, textAlign: "center", marginTop: 12 },
  introCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 450,
  },
  bulbRing: { width: 118, height: 118, borderRadius: 59, padding: 3 },
  bulbInner: {
    flex: 1,
    borderRadius: 56,
    backgroundColor: "#151515",
    justifyContent: "center",
    alignItems: "center",
  },
  dots: { flexDirection: "row", gap: 8, marginTop: 36, marginBottom: 32 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#888",
  },
});
