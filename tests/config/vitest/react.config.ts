import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const packages = path.join(root, "packages");

export default defineConfig({
  root,
  resolve: {
    alias: [
      { find: /^pulsoicon-react$/, replacement: path.join(packages, "react", "src", "index.ts") },
      { find: /^pulsoicon-react\/(.*)$/, replacement: path.join(packages, "react", "src", "$1") },
      { find: /^pulsoicon-core$/, replacement: path.join(packages, "core", "src", "index.ts") },
      { find: /^pulsoicon-core\/(.*)$/, replacement: path.join(packages, "core", "src", "$1") },
    ],
  },
  // Whole-catalog sweeps (every one of ~10k icons in one test): the default 5 s fails on a busy machine.
  test: { environment: "node", include: ["tests/unit/react/**/*.test.{ts,tsx}"], testTimeout: 60_000 },
});
