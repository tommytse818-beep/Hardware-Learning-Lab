import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("public");
const groups = new Map();

async function walk(directory) {
  for (const name of await readdir(directory)) {
    const full = path.join(directory, name);
    const info = await stat(full);
    if (info.isDirectory()) {
      await walk(full);
      continue;
    }
    const data = await readFile(full);
    const hash = createHash("sha256").update(data).digest("hex");
    const item = { path: path.relative(process.cwd(), full), bytes: info.size };
    groups.set(hash, [...(groups.get(hash) ?? []), item]);
  }
}

await walk(root);

const duplicates = [...groups.entries()]
  .filter(([, items]) => items.length > 1)
  .map(([sha256, items]) => ({ sha256, items }))
  .sort((a, b) => b.items.length - a.items.length);

console.log(JSON.stringify({ duplicateGroups: duplicates }, null, 2));
