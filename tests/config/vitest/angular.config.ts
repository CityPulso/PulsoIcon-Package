import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const packages = path.join(root, "packages");
const here = path.join(packages, "angular");

// The tests run the ng-packagr output (partial Ivy, linked at runtime by @angular/compiler), so `npm run build` comes first.
export default defineConfig({
  root,
  resolve: {
    alias: [
      { find: /^pulsoicon-angular$/, replacement: path.join(here, "dist", "fesm2022", "pulsoicon-angular.mjs") },
      { find: /^pulsoicon-angular\/(all|names)$/, replacement: path.join(here, "dist", "fesm2022", "pulsoicon-angular-$1.mjs") },
      { find: /^pulsoicon-core$/, replacement: path.join(packages, "core", "src", "index.ts") },
      { find: /^pulsoicon-core\/(.*)$/, replacement: path.join(packages, "core", "src", "$1") },
    ],
  },
  // Whole-catalog sweeps (every one of ~10k icons in one test): the default 5 s fails on a busy machine.
  test: { environment: "node", include: ["tests/unit/angular/**/*.test.ts"], testTimeout: 60_000 },
});
