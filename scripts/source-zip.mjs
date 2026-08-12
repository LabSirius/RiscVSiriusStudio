// Produce a clean source-code zip of the committed tree.
//
// Uses `git archive` (native zip, no external `zip` binary, cross-platform) so
// only tracked files are included -- node_modules and everything gitignored is
// excluded automatically, and submodules (doc/) are not recursed. On top of
// that we drop paths that don't belong in a source distribution: agent/tooling
// scratch, docs/site, and generated build output (src/templates Vite bundles,
// regenerable via `npm run build`).
//
// Run via: npm run source:zip            -> rv-simulator-src-<version>.zip
//          npm run source:zip -- out.zip -> custom output path

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");

const { version } = JSON.parse(
  readFileSync(resolve(repoRoot, "package.json"), "utf8")
);

const outFile = process.argv[2] ?? `rv-simulator-src-${version}.zip`;

// Tracked paths excluded from the source distribution. Untracked files, out/,
// node_modules and the doc/ submodule are already excluded by git archive.
const excludes = [
  ".scratch",        // agent issue-tracker scratch
  "site",            // Jekyll marketing site
  "docs",            // internal build/agent docs
  "src/templates",   // generated Vite bundles (build output)
  "AIDescription.md",
  "_ROADMAP.tmp.md",
];

const args = [
  "archive",
  "--format=zip",
  "-o",
  outFile,
  "HEAD",
  "--",
  ".",
  ...excludes.map((p) => `:(exclude)${p}`),
];

const res = spawnSync("git", args, { cwd: repoRoot, stdio: "inherit" });
if (res.status !== 0) {
  console.error(`[source:zip] git archive failed (exit ${res.status}).`);
  process.exit(res.status ?? 1);
}

console.log(`[source:zip] wrote ${outFile} (excluded: ${excludes.join(", ")})`);
