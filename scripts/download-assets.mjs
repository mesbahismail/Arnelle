import { mkdir, writeFile } from "node:fs/promises";
const source = await (
  await import("node:fs/promises")
).readFile("native/src/data.ts", "utf8");
const matches = [
  ...source.matchAll(/  (\w+): '(https:\/\/images.unsplash.com\/[^']+)'/g),
];
await mkdir("public/media", { recursive: true });
await Promise.all(
  matches.map(async ([, key, url]) => {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`${key}: ${r.status}`);
    await writeFile(
      `public/media/${key}.jpg`,
      Buffer.from(await r.arrayBuffer()),
    );
    console.log(`Downloaded ${key}`);
  }),
);
