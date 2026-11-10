import { readFile, writeFile, mkdir } from "node:fs/promises";
const read = (path) => readFile(path, "utf8");
const nativePackage = JSON.parse(await read("native/package.json"));
const nativeFiles = [
  "App.tsx",
  "src/ui.tsx",
  "src/capture-screen.tsx",
  "src/photo-effects.tsx",
  "src/icons.tsx",
  "src/typography.tsx",
  "src/story-viewer.tsx",
  "src/playback.ts",
  "src/brand.tsx",
  "src/motion.tsx",
  "src/entry-flow.tsx",
  "src/preview-chrome.tsx",
  "src/data.ts",
  "src/store.ts",
  "src/media.ts",
  "src/services.ts",
  "README.md",
];
const native = {
  $schema: "https://ui.shadcn.com/schema/registry-item.json",
  name: "rnl-native",
  type: "registry:block",
  title: "RNL · React Native social app",
  description:
    "Expo SDK 54 native social app with onboarding, discovery, communities, local messages, stories, and a live-room demo. See rnl/README.md after installation.",
  dependencies: Object.entries(nativePackage.dependencies).map(
    ([name, version]) => `${name}@${version}`,
  ),
  files: await Promise.all(
    nativeFiles.map(async (file) => ({
      path: `native/${file}`,
      type: "registry:file",
      target: `rnl/${file}`,
      content:
        file === "src/playback.ts"
          ? 'import { natureDemoVideoUrl } from "./services";\nexport const natureDemoVideoSource = natureDemoVideoUrl;\n'
          : await read(`native/${file}`),
    })),
  ),
  meta: {
    license: "MIT",
    framework: "expo",
    sdk: 54,
    setup:
      "Export rnl/App.tsx from your app entry. Merge the included app-config.example.json plugins and permissions, then rebuild your native client.",
  },
};
native.files.push({
  path: "native/app.json",
  type: "registry:file",
  target: "rnl/app-config.example.json",
  content: JSON.stringify(
    {
      expo: {
        plugins: JSON.parse(await read("native/app.json")).expo.plugins.filter(
          (plugin) =>
            !Array.isArray(plugin) || plugin[0] !== "expo-splash-screen",
        ),
        ios: {
          infoPlist: JSON.parse(await read("native/app.json")).expo.ios
            .infoPlist,
        },
      },
    },
    null,
    2,
  ),
});
const button = {
  $schema: "https://ui.shadcn.com/schema/registry-item.json",
  name: "rnl-button",
  type: "registry:ui",
  title: "RNL gradient button",
  description: "Source-owned gradient, outline, and ghost buttons using CVA.",
  dependencies: ["class-variance-authority", "clsx", "tailwind-merge"],
  files: [
    {
      path: "src/components/ui/button.tsx",
      type: "registry:file",
      target: "components/ui/rnl-button.tsx",
      content: `import './rnl-button.css';\n${(await read("src/components/ui/button.tsx")).replace("@/lib/utils", "./rnl-utils")}`,
    },
    {
      path: "src/lib/utils.ts",
      type: "registry:file",
      target: "components/ui/rnl-utils.ts",
      content: await read("src/lib/utils.ts"),
    },
    {
      path: "registry/rnl-button.css",
      type: "registry:file",
      target: "components/ui/rnl-button.css",
      content:
        ".button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:0 23px;border-radius:32px;border:0;font:600 14px system-ui;cursor:pointer;color:#fff}.button:disabled{opacity:.4;cursor:not-allowed}.button:focus-visible{outline:2px solid #ffc04b;outline-offset:4px}.button-gradient{background:linear-gradient(160deg,#ffc04b,#f77b43 45%,#df326f);box-shadow:inset 0 1px #ffe3b7}.button-outline{background:transparent;border:1px solid #77777d}.button-ghost{background:transparent;color:#aaaab1}.button-small{min-height:34px;font-size:12px;padding:0 14px}.button-icon{height:44px;width:44px;padding:0}",
    },
  ],
};
const items = [native, button];
await mkdir("public/r", { recursive: true });
for (const item of items)
  await writeFile(
    `public/r/${item.name}.json`,
    JSON.stringify(item, null, 2) + "\n",
  );
const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "rnl",
  homepage: "http://localhost:3000",
  items: items.map(({ $schema, ...item }) => ({
    ...item,
    files: item.files.map(({ content, ...file }) => file),
  })),
};
await writeFile("registry.json", JSON.stringify(registry, null, 2) + "\n");
await writeFile(
  "public/r/registry.json",
  JSON.stringify(registry, null, 2) + "\n",
);
console.log(
  `Built ${items.length} registry packages; ${native.files.length} native files included.`,
);
