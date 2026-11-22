import { existsSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

/**
 * Everything test-related lives in tests/ (`.claude/CLAUDE.md`): tests in unit/ and e2e/, helpers and data in support/,
 * scripts in tools/, the vitest / playwright / tsconfig files in config/, output in .output/. Nothing outside it.
 */
describe("tests/", () => {
  const TESTS = join(ROOT, "tests");
  const TEST_FOLDERS = ["unit", "e2e", "support", "tools", "config", ".output"];
  /** Folders outside tests/ that are not this project's code (dependencies, build output, local tool state). */
  const NOT_CODE = new Set(["node_modules", ".git", "tests", "dist", ".backup", ".build", "kotlin", "swift"]);
  const IS_TEST = /\.(test|spec|test-d)\.[cm]?[jt]sx?$|\.check\.ts$/;
  const TEST_TOOLING = /^(vitest|vitest\.workspace|playwright)\.config\.|^tsconfig\.test.*\.json$|^test-results$|^playwright-report$|^coverage$|^test-area\.[cm]?[jt]s$/;
  const relRoot = (p: string) => relative(ROOT, p).split(sep).join("/");
  const entries = (d: string) => readdirSync(d);
  const isDir = (p: string) => statSync(p).isDirectory();
  function walkAll(d: string, skip: (name: string) => boolean, out: string[] = []): string[] {
    for (const n of entries(d)) {
      if (skip(n)) continue;
      const p = join(d, n);
      out.push(p);
      if (isDir(p)) walkAll(p, skip, out);
    }
    return out;
  }
  const outside = walkAll(ROOT, (n) => NOT_CODE.has(n));
  const inside = existsSync(TESTS) ? walkAll(TESTS, (n) => n === ".output" || n === "node_modules") : [];
  const under = (folder: string) => inside.filter((p) => p.startsWith(join(TESTS, folder) + sep) && !isDir(p));

  it("has no tests, test config or test output outside tests/", () => {
    expect(outside.filter((p) => IS_TEST.test(p.split(sep).pop()!) || TEST_TOOLING.test(p.split(sep).pop()!)).map(relRoot)).toEqual([]);
  });

  it("holds only the fixed folders", () => {
    expect(entries(TESTS).filter((n) => !TEST_FOLDERS.includes(n))).toEqual([]);
  });

  it("keeps unit/ and e2e/ to tests", () => {
    expect([...under("unit"), ...under("e2e")].filter((p) => !IS_TEST.test(p.split(sep).pop()!)).map(relRoot)).toEqual([]);
  });

  it("keeps tests out of support/, tools/ and config/", () => {
    expect([...under("support"), ...under("tools"), ...under("config")].filter((p) => IS_TEST.test(p.split(sep).pop()!)).map(relRoot)).toEqual([]);
  });

  it("has no empty folders", () => {
    expect(inside.filter((p) => isDir(p) && entries(p).length === 0).map(relRoot)).toEqual([]);
  });

  /** Every folder under unit/ is a package, then a folder of its src/ (`packages/react/src/x/y.ts` → `tests/unit/react/x/y.test.ts`). */
  it("mirrors the source tree in unit/", () => {
    const UNIT = join(TESTS, "unit");
    const source = (d: string[]) => join(ROOT, "packages", d[0], "src", ...d.slice(1));
    const bad = inside.filter((p) => isDir(p) && p.startsWith(UNIT + sep)).filter((p) => {
      const src = source(relative(UNIT, p).split(sep));
      return !existsSync(src) || !isDir(src);
    });
    expect(bad.map(relRoot)).toEqual([]);
  });

  it("puts every e2e file in an area folder (tests/e2e/<area>/)", () => {
    expect(under("e2e").filter((p) => relative(join(TESTS, "e2e"), p).split(sep).length < 2).map(relRoot)).toEqual([]);
  });
});
