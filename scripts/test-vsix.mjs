// Smoke-test the packaged extension in a throwaway VS Code profile.
//
// Installs the most recently built *.vsix into isolated --user-data-dir and
// --extensions-dir (so nothing touches the developer's real VS Code setup),
// verifies the install exits cleanly, then launches an isolated window with the
// examples/ folder for a manual functional check.
//
// Run via: npm run test:vsix   (which builds the vsix first)
// Flags:   --no-launch   install + verify only, skip opening the GUI window

import { spawnSync, spawn } from "node:child_process";
import { mkdtempSync, readdirSync, statSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const launch = !process.argv.includes("--no-launch");

// `code` is `code.cmd` on Windows; shell:true resolves the right one.
const runCode = (args, opts = {}) =>
  spawnSync("code", args, { stdio: "inherit", shell: true, ...opts });

// Fail fast if the VS Code CLI is not on PATH.
if (runCode(["--version"], { stdio: "ignore" }).status !== 0) {
  console.error("[test:vsix] `code` CLI not found on PATH. Install it via VS Code: Command Palette -> 'Shell Command: Install code command in PATH'.");
  process.exit(1);
}

// Pick the newest .vsix in the repo root (npm run test:vsix builds it first).
const vsix = readdirSync(repoRoot)
  .filter((f) => f.endsWith(".vsix"))
  .map((f) => ({ f, m: statSync(join(repoRoot, f)).mtimeMs }))
  .sort((a, b) => b.m - a.m)[0]?.f;

if (!vsix) {
  console.error("[test:vsix] No .vsix found in repo root. Run `npm run vsix` first.");
  process.exit(1);
}

const testDir = mkdtempSync(join(tmpdir(), "vsix-smoke-"));
const dataDir = join(testDir, "data");
const extDir = join(testDir, "ext");
const isolated = ["--user-data-dir", dataDir, "--extensions-dir", extDir];

console.log(`[test:vsix] vsix     : ${vsix}`);
console.log(`[test:vsix] profile  : ${testDir}`);

const cleanup = () => {
  try {
    rmSync(testDir, { recursive: true, force: true });
    console.log(`[test:vsix] cleaned up ${testDir}`);
  } catch (err) {
    console.error(`[test:vsix] cleanup failed for ${testDir}: ${err.message}`);
  }
};

console.log("[test:vsix] installing into isolated profile...");
const install = runCode([...isolated, "--install-extension", join(repoRoot, vsix)]);
if (install.status !== 0) {
  console.error(`[test:vsix] install FAILED (exit ${install.status}).`);
  cleanup();
  process.exit(1);
}

console.log("[test:vsix] install OK. Registered extensions:");
runCode([...isolated, "--list-extensions", "--show-versions"]);

if (!launch) {
  cleanup();
  console.log("[test:vsix] PASS (install-only).");
  process.exit(0);
}

// Launch an isolated window for a manual click-through. Detached so this
// script returns; the temp profile is removed once that window is closed.
console.log("[test:vsix] launching isolated window (close it to finish + clean up)...");
const child = spawn("code", [...isolated, "--wait", join(repoRoot, "examples")], {
  stdio: "inherit",
  shell: true,
});
child.on("exit", () => {
  cleanup();
  console.log("[test:vsix] PASS.");
});
