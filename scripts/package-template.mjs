import { mkdir, copyFile, mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
const folder = await mkdtemp(join(tmpdir(), "rnl-package-"));
const target = join(folder, "rnl-native");
await mkdir(join(target, "src"), { recursive: true });
await mkdir(join(target, "assets"), { recursive: true });
const files = [
  "assets/icon.png",
  "assets/splash.png",
  "App.tsx",
  "index.ts",
  "package.json",
  "package-lock.json",
  "app.json",
  "app.config.js",
  "tsconfig.json",
  "README.md",
  "src/ui.tsx",
  "src/brand.tsx",
  "src/motion.tsx",
  "src/entry-flow.tsx",
  "src/preview-chrome.tsx",
  "src/data.ts",
  "src/store.ts",
  "src/media.ts",
  "src/services.ts",
];
for (const file of files) await copyFile(`native/${file}`, join(target, file));
for (const file of ["LICENSE", "ASSETS.md"])
  await copyFile(file, join(target, file));
await mkdir(join(target, "registry"), { recursive: true });
await copyFile(
  "public/r/rnl-native.json",
  join(target, "registry/rnl-native.json"),
);
const zip = resolve("public/rnl-template.zip");
execFileSync("zip", ["-qr", zip, "rnl-native"], { cwd: folder });
console.log(
  `Packaged ${files.length} source/config files. Download: /rnl-template.zip`,
);
