import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
execFileSync(
  process.execPath,
  [
    "node_modules/expo/bin/cli",
    "export",
    "--platform",
    "web",
    "--output-dir",
    "../public/ios",
  ],
  {
    cwd: "native",
    stdio: "inherit",
    env: {
      ...process.env,
      EXPO_NO_TELEMETRY: "1",
      RNL_PREVIEW_BASE_URL: "/ios",
    },
  },
);
const file = "public/ios/index.html";
let html = await readFile(file, "utf8");
html = html
  .replace("<head>", '<head><base href="/ios/">')
  .replaceAll('src="/_expo/', 'src="/ios/_expo/')
  .replaceAll('href="/favicon.ico"', 'href="/icon.svg"');
html = html.replace(
  "</head>",
  "<style>html,body,#root{height:100%;width:100%;overflow:hidden;background:#202020}body{margin:0}*::-webkit-scrollbar{display:none}</style></head>",
);
await writeFile(file, html);
console.log("iPhone preview built from native/App.tsx at /ios/index.html");
