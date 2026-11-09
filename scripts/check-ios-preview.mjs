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
  await press("Profile");
  expectText("Arnelle Williams");
  await press("Open menu");
  expectText("Saved reels");
  await press("Logout");
  await wait(1600);
  expectText("ARNELLE");
  await press("Login with Google");
  expectText("No social account will be connected.");
  await press("Continue in demo mode");
  expectText("Let’s setup your account");
  await press("Skip →");
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
  if (!video || !video.src.includes("flower.mp4"))
    throw new Error("Nature video is missing");
  await wait(4100);
  expectText("A little moment of peace");
  await press("Like live stream");
  expectText("♥");
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
  const stored = Object.keys(w.localStorage)
    .map((key) => w.localStorage.getItem(key))
    .join(" ");
  if (/sample1234|demo1234|different123/.test(stored))
    throw new Error("Password leaked into local storage");
  if (errors.length) throw new Error(`Runtime errors: ${errors.join("\n")}`);
  console.log(
    "PASS: splash/welcome, login validation, recovery, sign-up validation, setup, onboarding, all five tabs, menu, logout, provider demo, login, nature video source, incoming live comments, hearts, sending comments, and gift debit.",
  );
  console.log(
    "PASS: iOS chrome, no persisted passwords, and zero captured runtime errors.",
  );
} finally {
  dom.window.close();
}
