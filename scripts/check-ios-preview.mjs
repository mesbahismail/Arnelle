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
await wait(100);
const startup = w.document.querySelector('[data-testid="startup-logo"]');
if (!startup?.querySelector("svg") || startup.textContent.trim())
  throw new Error("Startup loader must show only the logo");
await wait(1700);
const skeletonPages = new Set();
async function press(name, settle = true) {
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
  const skeleton = w.document.querySelector('[data-testid="page-skeleton"]');
  if (skeleton) {
    skeletonPages.add(skeleton.getAttribute("aria-label"));
    if (skeleton.getAttribute("aria-busy") !== "true")
      throw new Error("Skeleton must expose its loading state");
  }
  if (settle) {
    for (
      let i = 0;
      i < 20 && w.document.querySelector('[data-testid="page-skeleton"]');
      i++
    )
      await wait(50);
    if (w.document.querySelector('[data-testid="page-skeleton"]'))
      throw new Error("Page skeleton did not finish");
  }
}
const expectText = (label) => {
  if (!w.document.body.textContent.includes(label))
    throw new Error(`Native screen missing: ${label}`);
};
function expectButtonMargin(label, points) {
  const button = [
    ...w.document.querySelectorAll('[role="button"], [tabindex="0"]'),
  ].find(
    (node) =>
      node.getAttribute("aria-label") === label ||
      node.textContent.trim() === label,
  );
  const margin = button && w.getComputedStyle(button).marginTop;
  if (margin !== `${points}px`)
    throw new Error(
      `${label}: expected ${points}px spacing, received ${margin}`,
    );
}
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
function entryBlur() {
  const layer = w.document.querySelector(
    '[data-testid="entry-background-blur"]',
  );
  const filter =
    layer?.style.backdropFilter || layer?.style.webkitBackdropFilter || "";
  const radius = filter.match(/blur\(([\d.]+)px\)/)?.[1];
  if (radius === undefined)
    throw new Error("Entry background blur layer is missing");
  return Number(radius);
}
try {
  expectText("ARNELLE");
  expectButtonMargin("Login with Facebook", 12);
  expectButtonMargin("Login with Google", 12);
  expectText("9:41");
  const welcomePhoto = w.document.querySelector(
    '[data-testid="entry-background"] img',
  );
  if (entryBlur() !== 0)
    throw new Error("Welcome background should start clear");
  await press("Login");
  expectText("Welcome back");
  if (!(entryBlur() > 0 && entryBlur() < 12))
    throw new Error("Login background must progressively blur");
  if (
    w.document.querySelector('[data-testid="entry-background"] img') !==
    welcomePhoto
  )
    throw new Error("Navigating to login replaced the background photo");
  await wait(700);
  if (entryBlur() !== 12) throw new Error("Login blur did not finish");
  await press("Go back");
  if (!(entryBlur() > 0 && entryBlur() < 12))
    throw new Error("Returning to welcome must progressively clear the blur");
  await wait(700);
  if (entryBlur() !== 0)
    throw new Error("Welcome background did not become clear");
  await press("Create account");
  if (!(entryBlur() > 0 && entryBlur() < 12))
    throw new Error("Sign-up background must progressively blur");
  await wait(700);
  await press("Go back");
  await press("Login");
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
  expectButtonMargin("Skip →", 12);
  await press("Get started");
  expectText("Tell us about you");
  if (entryBlur() !== 12)
    throw new Error("Onboarding should retain the blurred entry background");
  for (const label of ["BIRTHDAY", "GENDER", "NATIONALITY", "LANGUAGE"])
    expectText(label);
  await press("Next");
  expectText("Choose your interests");
  expectButtonMargin("Skip →", 12);
  await press("Next");
  expectText("Follow creators");
  expectButtonMargin("Skip →", 12);
  await press("Next");
  expectText("What’s new");
  await press("Browse", false);
  await press("Communities", false);
  await press("Browse");
  expectText("Browse");
  await press("Communities");
  expectText("Art World");
  await press("Messaging");
  expectText("@talia");
  await press("View story by talia");
  expectText("Story 1 of 3");
  if (w.document.querySelector('[aria-label="Send gift"]'))
    throw new Error("Stories must not show a gift button");
  fill("Story reply", "Love this story!");
  await wait(7200);
  expectText("Story 1 of 3");
  await press("Send story reply");
  expectText("Message sent");
  if (w.document.querySelector('[aria-label="Story reply"]').value)
    throw new Error("Story reply did not clear after sending");
  await press("Pause story");
  await press("Next story");
  expectText("Story 2 of 3");
  await press("Close story");
  expectText("Messaging");
  await press("Chat with talia");
  expectText("Love this story!");
  expectText("Open video");
  await press("Open shared reel");
  if (!w.document.querySelector("video"))
    throw new Error("Shared reel viewer did not open");
  if (w.document.querySelector('[aria-label="Send gift"]'))
    throw new Error("Regular reels must not show a gift button");
  fill("Reel reply", "Beautiful golden hour!");
  await wait();
  await press("Send reel reply");
  expectText("Message sent");
  if (w.document.querySelector('[aria-label="Reel reply"]').value)
    throw new Error("Reel reply did not clear after sending");
  await press("Close reel");
  expectText("Open video");
  await press("Go back");
  await press("Chat with nara");
  expectText("Beautiful golden hour!");
  await press("Go back");
  await press("Profile");
  expectText("Arnelle Williams");
  for (const page of [
    "Discover",
    "Browse",
    "Communities",
    "Messaging",
    "Profile",
  ])
    if (!skeletonPages.has(`Loading ${page}`))
      throw new Error(`Missing skeleton transition for ${page}`);
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
  expectText("What’s new");
  if (w.document.body.textContent.includes("Let’s setup your account"))
    throw new Error("Login must skip setup");
  await press("Profile");
  await press("Open menu");
  await press("Logout");
  await wait(1600);
  await press("Login");
  await press("Facebook");
  expectText("What’s new");
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
  const sentComment = w.document.querySelector(
    '[data-testid^="live-comment-you-"]',
  );
  if (!sentComment) throw new Error("Sent comment is missing its animated row");
  let sawCommentFade = false;
  for (let i = 0; i < 60 && sentComment.isConnected; i++) {
    const opacity = Number(w.getComputedStyle(sentComment).opacity);
    if (opacity > 0 && opacity < 1) {
      sawCommentFade = true;
      break;
    }
    await wait(100);
  }
  if (!sawCommentFade) throw new Error("Old comments must fade before removal");
  await wait(650);
  if (sentComment.isConnected) throw new Error("Faded comment was not removed");
  if (w.document.querySelector('[data-testid="live-comment-initial-1"]'))
    throw new Error("Expired initial comment remained in the live room");
  if (!w.document.querySelector('[data-testid^="live-comment-incoming-"]'))
    throw new Error("Incoming comments stopped while old comments faded");
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
