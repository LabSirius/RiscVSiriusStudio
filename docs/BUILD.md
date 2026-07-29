# Building the VS Code extension from source

> **Where this lives & why:** saved as `docs/BUILD.md`. The repo keeps
> agent-workflow notes under `docs/agents/` and architecture decisions under
> `docs/adr/`. Build/dev instructions for a human developer are neither of
> those, so they go in the top-level developer-docs area `docs/` as `BUILD.md`
> (discoverable next to `docs/agents/` and `docs/adr/`).
>
> Every claim below is traced to the file (and script) that owns it. Nothing
> here is assumed from convention.

---

## 1. What this repo produces

A single VS Code extension: **`rv-simulator`** ("RISCV simulator"),
`version 0.0.7`, entry point `./out/extension.js`
(`package.json` → `name`, `displayName`, `version`, `main`).

It is **not** an npm workspace. There is no `workspaces` field in the root
`package.json`, and each sub-package has its own `package-lock.json`. It is
better described as a **root extension package plus two standalone React/Vite
webview apps** that build into the extension's `src/templates/` folder.

### Packages / build units

| Path | package name | Builds with | Output | Wired into build? |
|------|--------------|-------------|--------|-------------------|
| `/` (root) | `rv-simulator` | esbuild (`esbuild.js`) | `out/extension.js`, `out/graphicSimulator.js`, `out/textSimulator.js` | yes — `npm run compile` / `package` |
| `client/simulator` | `client` | `tsc -b && vite build` | `src/templates/simulator/` | **yes** — invoked by `esbuild.js` |
| `client/instructionSet` | `client` | `tsc -b && vite build` | `src/templates/instructionSet/` | **no** — must be built manually |

- Root esbuild targets: `src/extension.ts` (Node/CJS, external `vscode`),
  `src/simulators/graphicSimulator/graphicSimulator.ts` and
  `src/simulators/textSimulator/textSimulator.ts` (both ESM, target es2020)
  — `esbuild.js` lines 42-110.
- `esbuild.js` (lines 12-28, 155-159) shells out to
  `npm run build` inside `client/simulator` **before** building the extension,
  so the served React webview bundle never drifts.
- `client/simulator/vite.config.ts` writes its bundle to
  `../../src/templates/simulator` (`build.outDir`).
- `client/instructionSet/vite.config.ts` writes to
  `../../src/templates/instructionSet`, and the extension serves it from
  `src/templates/instructionSet` (`src/simulators/instructionSet/provider.ts`
  lines 24, 34, 37). **`esbuild.js` never builds `instructionSet`**, so its
  bundle is served from whatever is committed under `src/templates/instructionSet/`
  (currently committed to git). Rebuild it by hand if you change that app
  (see §7).

---

## 2. Prerequisites

| Tool | Required version | Source |
|------|-----------------|--------|
| VS Code | `^1.75.0` (1.75.0 or newer) | root `package.json` → `engines.vscode`; README "Requirements" |
| Node.js | CI uses **Node 24**; devcontainer image is Node 20 | `.github/workflows/ci.yml` & `build-vsix.yml` (`node-version: '24'`); `.devcontainer/devcontainer.json` (`typescript-node:1-20-bookworm`) |
| Package manager | **npm** | only `package-lock.json` lockfiles exist (root + both client apps); no `pnpm-lock.yaml`/`yarn.lock`. There is no `.nvmrc`. |
| `@vscode/vsce` | `^3.3.0` | root `package.json` deps/devDeps; also `npm install -g @vscode/vsce` in `.devcontainer/post_create.sh` and `build-vsix.yml` |

`@vscode/vsce` is also listed as a project dependency, so `npx vsce` works
without a global install; the CI and devcontainer install it globally.

> Note: `@types/node` is pinned to `16.x` in the root `package.json` even
> though CI runs Node 24. That only affects the ambient type surface, not the
> runtime.

---

## 3. Install

Root extension deps:

```bash
npm install          # or: npm ci  (CI uses npm ci — ci.yml)
```

The `client/simulator` webview is built by `esbuild.js`, which runs
`npm run build` in that directory but does **not** install its deps. Install
them once (CI does this as a separate step):

```bash
npm ci --prefix client/simulator          # ci.yml / build-vsix.yml
# and, only if you touch the instruction-set app:
npm ci --prefix client/instructionSet
```

(`.devcontainer/post_create.sh` runs `npm install` at the root and installs
`vsce` globally, plus Ruby/Jekyll for the docs site — the site is unrelated to
the extension build.)

---

## 4. Development build

```bash
npm run compile
```

- Maps to `node ./esbuild.js` (root `package.json` → `scripts.compile`).
- `NODE_ENV` is unset, so `esbuild.js` (lines 34-38) sets
  `minify: false` and `sourcemap: true`.
- Steps performed by `esbuild.js` (non-watch branch, lines 154-159):
  1. `buildClientWebview({watch:false})` → `execSync("npm run build")` in
     `client/simulator` (= `tsc -b && vite build` → `src/templates/simulator`).
  2. esbuild bundles `src/extension.ts` → `out/extension.js`, copies
     `media/RobotoMono.ttf` into `out/`, and cleans `out/` except
     `out/webview` (`clean` plugin, line 63).
  3. esbuild bundles `graphicSimulator.ts` → `out/graphicSimulator.js`.
  4. esbuild bundles `textSimulator.ts` → `out/textSimulator.js`.

## 5. Production build

```bash
npm run package
```

- Maps to `cross-env NODE_ENV=production node ./esbuild.js`
  (root `package.json` → `scripts.package`).
- Same steps as §4 but `NODE_ENV=production` → `minify: true`,
  `sourcemap: false` (`esbuild.js` lines 34-38).
- This is what `vsce` runs automatically: `scripts["vscode:prepublish"]` =
  `npm run package`.

> The client webview's own `vite build` is a production Rollup build regardless
> of the extension's `NODE_ENV`; `NODE_ENV` only changes the esbuild half.

---

## 6. Run / debug in the Extension Development Host

1. Open the repo in VS Code.
2. Press **F5** (or Run and Debug → **"Run Extension"**).
   - Config name: **`Run Extension`**, type `extensionHost`
     (`.vscode/launch.json`).
   - It launches with `--extensionDevelopmentPath=${workspaceFolder}` and
     `debugWebviews: true`.
   - `preLaunchTask: "${defaultBuildTask}"` runs the default build task first.
3. The default build task is the npm **`compile`** task
   (`.vscode/tasks.json` → the `npm: compile` task has
   `group.kind: build, isDefault: true`, problem matcher `$esbuild-watch`).
   So F5 runs `npm run compile` (a full dev build, §4) before opening the
   Extension Development Host.

---

## 7. Rebuilding the instruction-set webview (manual)

Nothing in `esbuild.js` or CI builds `client/instructionSet`. If you change it:

```bash
npm ci --prefix client/instructionSet      # first time only
npm run build --prefix client/instructionSet   # tsc -b && vite build -> src/templates/instructionSet
```

Then commit the regenerated `src/templates/instructionSet/` bundle (it is
tracked in git).

---

## 8. Packaging a distributable `.vsix`

Two supported paths, both use `@vscode/vsce`:

```bash
# From root package.json scripts:
npm run package2        # = "vsce package"
```

or the way CI does it (`.github/workflows/build-vsix.yml`, runs on push to
`main`):

```bash
npm install
npm ci --prefix client/simulator
npm run build --prefix client/simulator     # ensures a fresh simulator bundle
npm install -g @vscode/vsce
vsce package --no-yarn
```

- `vsce package` first runs `vscode:prepublish` → `npm run package` (§5), so
  the extension + simulator webview are rebuilt as part of packaging.
- What ships is governed by `.vscodeignore`: it excludes `.vscode/**`,
  `node_modules/**`, `**/tsconfig.json`, `**/*.map`, `.env*`, etc., and
  **keeps `out/**`**. `src/` is not ignored, so the served
  `src/templates/simulator` and `src/templates/instructionSet` bundles are
  included in the `.vsix`.
- The output artifact is `rv-simulator-0.0.7.vsix` (name+version from
  `package.json`); CI uploads `*.vsix` as an artifact.

---

## 9. Watch / dev loop

```bash
npm run watch      # = node ./esbuild.js --watch
```

- Watch branch of `esbuild.js` (lines 133-153): starts a detached
  `npm run build -- --watch` (`vite build --watch`) in `client/simulator`,
  then puts the esbuild extension bundle in watch mode.

> **GOTCHA — `npm run watch` is currently broken.** The watch branch
> (`esbuild.js` lines 141-152) spreads three configs that are **never defined**
> in the file: `simulatorviewConfig`, `registersviewConfig`,
> `registersviewConfigTextSimulator`. Only `extensionConfig`,
> `graphicSimulatorConfig` and `textSimulatorSimulator` exist. So watch mode
> throws a `ReferenceError` after the first `build()`. Use `npm run compile`
> for now, or fix the config names before relying on watch.

Client-only dev servers also exist (not needed for the extension host):
`npm run dev` in `client/simulator` or `client/instructionSet` (= `vite`).

---

## 10. Other scripts (root `package.json`)

| Script | Command | Purpose |
|--------|---------|---------|
| `test` | `vitest run` | run extension unit tests (`vitest.config.ts`) |
| `test:watch` | `vitest` | watch-mode tests |
| `lint` | `eslint src --ext ts` | lint extension source |
| `parser` | `npx peggy ... --format commonjs ... riscv.peg` | regenerate `src/utilities/riscv.ts` parser (CommonJS) |
| `parservs` | `npx peggy ... --format es ...` | same, ESM output |
| `assembler` | `npx tsc src/utilities/cli.ts` | compile the CLI assembler |
| `clean` | `rimraf out node_modules package-lock.json` | wipe build + deps |
| `rebuild` | `npm run clean && npm install && npm run compile` | full from-scratch rebuild |

`client/simulator` also has `test`/`test:watch` (`vitest`).

---

## 11. Gotchas summary

1. **`npm run watch` throws** — references undefined esbuild configs
   (§9). Use `npm run compile`.
2. **`client/simulator` deps are not auto-installed.** `esbuild.js` runs
   `npm run build` there but never `npm install`; a clean checkout must run
   `npm ci --prefix client/simulator` first or the compile step fails (§3).
3. **`client/instructionSet` is never built by the extension build** — its
   bundle is only what is committed under `src/templates/instructionSet/`.
   Rebuild manually after changes (§7).
4. **Vite `@protocol` alias must mirror the tsconfig `paths`.**
   `client/simulator/vite.config.ts` sets `@protocol` →
   `../../src/protocol` to match `tsconfig.app.json`'s `@protocol/*`. Without
   it, `tsc -b` passes but the production `vite build` (Rollup) fails to
   resolve the shared protocol module, shipping a blank webview. This gap is
   exactly why `ci.yml`'s `extension` job runs the real `vite build`.
   (`instructionSet` has no `@protocol` alias because it does not import it.)
5. **Build ordering matters.** The webview (`vite build` → `src/templates/...`)
   must be built before packaging, because the `.vsix` ships the committed/
   generated `src/templates/` bundle, not a vsce-built one. `esbuild.js` and
   CI both build the simulator webview first.
6. **Node version mismatch is fine.** CI uses Node 24, the devcontainer image
   is Node 20; either works. `@types/node` pinned at `16.x` is type-only.
