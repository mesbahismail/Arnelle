import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const Ajv = require("ajv");
const ajv = new Ajv({ allErrors: true });
for (const [kind, names] of [
  ["registry-item", ["rnl-native", "rnl-button"]],
  ["registry", ["registry"]],
]) {
  const response = await fetch(`https://ui.shadcn.com/schema/${kind}.json`);
  if (!response.ok) throw new Error(`Cannot load ${kind} schema`);
  const schema = await response.json();
  schema.$schema = schema.$schema?.replace(
    "https://json-schema.org",
    "http://json-schema.org",
  );
  ajv.addSchema(schema, `https://ui.shadcn.com/schema/${kind}.json`);
  const validate = ajv.getSchema(`https://ui.shadcn.com/schema/${kind}.json`);
  for (const name of names) {
    const data = JSON.parse(await readFile(`public/r/${name}.json`, "utf8"));
    if (!validate(data)) throw new Error(JSON.stringify(validate.errors));
    console.log(`${name}: valid against official ${kind} schema`);
  }
}
