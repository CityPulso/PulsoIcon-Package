import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

/** The repository-wide checks (tests/unit/*.test.ts); each package's own tests run through its own config. */
export default defineConfig({
  root,
  test: { environment: "node", include: ["tests/unit/*.test.ts"] },
});
