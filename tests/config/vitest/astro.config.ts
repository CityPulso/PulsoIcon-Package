/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const packages = path.join(root, "packages");

export default getViteConfig({
  root,
  resolve: {
    alias: [
      { find: /^pulsoicon-astro$/, replacement: path.join(packages, "astro", "src", "index.ts") },
      { find: /^pulsoicon-astro\/(.*)$/, replacement: path.join(packages, "astro", "src", "$1") },
      { find: /^pulsoicon-core$/, replacement: path.join(packages, "core", "src", "index.ts") },
      { find: /^pulsoicon-core\/(.*)$/, replacement: path.join(packages, "core", "src", "$1") },
    ],
  },
  // Whole-catalog sweeps (every one of ~10k icons in one test): the default 5 s fails on a busy machine.
  test: { environment: "node", include: ["tests/unit/astro/**/*.test.ts"], testTimeout: 60_000 },
});
