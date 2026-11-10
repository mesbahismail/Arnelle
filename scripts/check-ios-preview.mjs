import { readFile } from "node:fs/promises";
import { JSDOM, VirtualConsole } from "jsdom";
const html = await readFile("public/ios/index.html", "utf8");
const scriptPath = html.match(/src="([^"]+\.js)"/)?.[1];
if (!scriptPath) throw new Error("No React Native bundle in iPhone preview");
const source = await readFile(`public${scriptPath}`, "utf8");
const errors = [];
const vc = new VirtualConsole();
vc.on("jsdomError", (e) => {
  if (!e.message.includes("Not implemented: HTMLMediaElement"))
    errors.push(e.message);
});
vc.on("error", (...args) => errors.push(args.map(String).join(" ")));
const dom = new JSDOM(html.replace(/<script[^>]+src[^>]+><\/script>/g, ""), {
  url: "http://localhost:3000/ios/index.html",
  runScripts: "outside-only",
  pretendToBeVisual: true,
  virtualConsole: vc,
});
const w = dom.window;
Object.defineProperty(w, "innerWidth", { value: 393 });
Object.defineProperty(w, "innerHeight", { value: 852 });
Object.defineProperty(w.document.documentElement, "clientWidth", {
  value: 393,
});
Object.defineProperty(w.document.documentElement, "clientHeight", {
  value: 852,
});
w.matchMedia = (q) => ({
  matches: false,
  media: q,
  addListener() {},
  removeListener() {},
  addEventListener() {},
  removeEventListener() {},
});
w.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
w.HTMLMediaElement.prototype.load = () => {};
w.HTMLMediaElement.prototype.pause = () => {};
w.HTMLMediaElement.prototype.play = () => Promise.resolve();
w.requestIdleCallback = (cb) =>
  w.setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 50 }), 0);
w.URL.createObjectURL = () => "blob:demo";
w.fetch = async () => new Response("{}", { status: 200 });
w.Worker = class {
  postMessage() {}
  terminate() {}
  addEventListener() {}
};
w.navigator.permissions = { query: async () => ({ state: "prompt" }) };
const fontStyle = w.document.createElement("style");
fontStyle.textContent = "@font-face{font-family:test;src:url(test)}";
w.document.head.appendChild(fontStyle);
w.CSSFontFaceRule = fontStyle.sheet.cssRules[0].constructor;
Object.defineProperty(w.navigator, "userAgent", {
  value:
    "Mozilla/5.0 (Macintosh) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15",
});
w.eval(source);
const wait = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));
await wait(1800);
async function press(name) {
  const nodes = [
    ...w.document.querySelectorAll(
      '[tabindex="0"], [role="button"], [role="tab"]',
    ),
  ];
  const target = nodes.find(
    (n) =>
      n.getAttribute("aria-label") === name || n.textContent.trim() === name,
  );
  if (!target) throw new Error(`Native control missing: ${name}`);
  target.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  await new Promise((resolve) => setTimeout(resolve, 100));
}
const expectText = (label) => {
  if (!w.document.body.textContent.includes(label))
    throw new Error(`Native screen missing: ${label}`);
};
function fill(label, value) {
  const input = [...w.document.querySelectorAll("input")].find(
    (n) => n.getAttribute("aria-label") === label,
  );
  if (!input) throw new Error(`Missing input: ${label}`);
  Object.getOwnPropertyDescriptor(
    w.HTMLInputElement.prototype,
    "value",
  ).set.call(input, value);
  input.dispatchEvent(new w.Event("input", { bubbles: true }));
}
try {
  expectText("ARNELLE");
  expectText("9:41");
  await press("Login");
  expectText("Welcome back");
  await press("Login");
  expectText("Enter your username and password.");
  fill("Username", "incorrect");
  fill("Password", "incorrect");
  await wait();
  await press("Login");
  expectText("For this template, use arnelle and demo1234.");
  await press("Forgot password?");
  await press("Send reset link");
  expectText("Enter a valid email address.");
  fill("Email", "sample@example.com");
  await wait();
  await press("Send reset link");
  expectText("no reset email was sent");
  await press("Got it");
  await press("Back to login");
  await press("Email or number");
  expectText("Create your account");
  fill("Username", "");
  await wait();
  await press("Create account");
  expectText("Use 3–24 letters");
  fill("Username", "sample_creator");
  fill("Email", "sample@example.com");
  fill("Password", "sample1234");
  fill("Repeat password", "different123");
  await wait();
  await press("Create account");
  expectText("Your passwords don’t match.");
  fill("Repeat password", "sample1234");
  await wait();
  await press("Create account");
  expectText("Let’s setup your account");
  await press("Get started");
  expectText("Tell us about you");
  for (const label of ["BIRTHDAY", "GENDER", "NATIONALITY", "LANGUAGE"])
    expectText(label);
  await press("Next");
  expectText("Choose your interests");
  await press("Next");
  expectText("Follow creators");
  await press("Next");
  expectText("What’s new");
  await press("Browse");
  expectText("Browse");
  await press("Communities");
  expectText("Art World");
  await press("Messaging");
  expectText("@talia");
  await press("View story by talia");
  expectText("Story 1 of 3");
  await press("Pause story");
  await press("Next story");
  expectText("Story 2 of 3");
  await press("Close story");
  expectText("Messaging");
  await press("Chat with talia");
  expectText("Open video");
  await press("Open shared reel");
  if (!w.document.querySelector("video"))
    throw new Error("Shared reel viewer did not open");
  await press("Close reel");
  expectText("Open video");
  await press("Go back");
  await press("Profile");
  expectText("Arnelle Williams");
  const grid = w.document.querySelector('[data-testid="profile-reels"]');
  const cardWidths = [...grid.children]
    .slice(0, 2)
    .map((card) => parseFloat(w.getComputedStyle(card).width));
  if (
    cardWidths.length !== 2 ||
    cardWidths.some((width) => !width) ||
    cardWidths[0] + cardWidths[1] + 8 + 32 > 393
  )
    throw new Error(
      `Profile cards do not fit two per row: ${cardWidths} / ${grid.outerHTML.slice(0, 800)}`,
    );
  await press("Open menu");
  expectText("Saved reels");
  await press("Logout");
  await wait(1600);
  expectText("ARNELLE");
  await press("Login with Google");
  expectText("No social account will be connected.");
  await press("Continue in demo mode");
  expectText("What’s new");
  if (w.document.body.textContent.includes("Let’s setup your account"))
    throw new Error("Login must skip setup");
  await press("Profile");
  await press("Open menu");
  await press("Logout");
  await wait(1600);
  await press("Login");
  fill("Username", "arnelle");
  fill("Password", "demo1234");
  await wait();
  await press("Login");
  expectText("What’s new");
  await press("Live: Taking the scenic route by brook");
  expectText("Demo live room");
  const video = w.document.querySelector("video");
  if (!video || !video.src.includes("nature"))
    throw new Error("Nature video is missing");
  const videoBytes = await readFile(`public${new URL(video.src).pathname}`);
  if (videoBytes.byteLength < 1000)
    throw new Error("Bundled nature clip is missing");
  await wait(1900);
  expectText("A little moment of peace");
  await press("Like live stream");
  if (!w.document.querySelector('[data-testid="live-heart"] svg'))
    throw new Error("White heart particles missing");
  if (w.document.body.textContent.includes("Video could not load"))
    throw new Error("Video error banner must not cover the reel");
  fill("Live comment", "Beautiful nature!");
  await wait();
  await press("Send comment");
  expectText("Beautiful nature!");
  await press("Send gift");
  expectText("★ 388");
  await press("Confirm gift");
  expectText("1× Lily");
  await press("Send gift");
  expectText("★ 338");
  await press("Close sheet");
  await press("Close reel");
  expectText("What’s new");
  if (
    w.document.querySelectorAll('[data-testid="discover-divider"]').length !== 2
  )
    throw new Error("Discover section dividers missing");
  await press("Open camera");
  expectText("3s");
  expectText("Black & White");
  expectText("Popstar");
  await press("Take photo");
  await wait(1100);
  await press("Cancel capture timer");
  await press("Close camera");
  await wait(2200);
  expectText("What’s new");
  await press("Open camera");
  await press("Capture settings");
  await press("Off");
  await press("Close sheet");
  await press("Filter Black & White");
  if (!w.document.querySelector('feColorMatrix[values="0"]'))
    throw new Error("Black & White filter not applied");
  await press("Take photo");
  expectText("Add story");
  await press("Close screen");
  expectText("What’s new");
  const stored = Object.keys(w.localStorage)
    .map((key) => w.localStorage.getItem(key))
    .join(" ");
  if (/sample1234|demo1234|different123/.test(stored))
    throw new Error("Password leaked into local storage");
  if (errors.length) throw new Error(`Runtime errors: ${errors.join("\n")}`);
  console.log(
    "PASS: splash/welcome, login validation, recovery, sign-up validation, setup, onboarding, all five tabs, menu, logout, direct login, avatar stories, shared-reel playback, two-column profile layout, bundled nature video, frequent live comments, white hearts, gift debit, full-width Discover dividers, capture controls, timer cancellation, and filtered capture.",
  );
  console.log(
    "PASS: iOS chrome, no persisted passwords, and zero captured runtime errors.",
  );
} finally {
  dom.window.close();
}
