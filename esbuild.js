const { build } = require("esbuild");
const { copy } = require("esbuild-plugin-copy");
const { clean } = require("esbuild-plugin-clean");
const { execSync, spawn } = require("child_process");
const path = require("path");

// The React webview lives in client/simulator and is built by Vite into
// src/templates/simulator (the bundle the extension's providers serve). It is
// NOT an esbuild target, so without this it only rebuilt on a manual
// `npm run build` there — leaving the running webview stale after a main build.
// Build it as part of the main build so the served webview never drifts.
const CLIENT_DIR = path.join(__dirname, "client", "simulator");
function buildClientWebview({ watch }) {
  if (watch) {
    // Long-running: tsc -b then `vite build --watch`. Spawn detached from the
    // esbuild watchers so it keeps the webview fresh on every source change.
    console.log("[webview] starting Vite watch (client/simulator)");
    const child = spawn("npm", ["run", "build", "--", "--watch"], {
      cwd: CLIENT_DIR,
      stdio: "inherit",
      shell: true,
    });
    child.on("error", (err) => console.error(`[webview] watch failed: ${err.message}`));
    return;
  }
  console.log("[webview] building client/simulator -> src/templates/simulator");
  execSync("npm run build", { cwd: CLIENT_DIR, stdio: "inherit" });
}

//@ts-check
/** @typedef {import('esbuild').BuildOptions} BuildOptions **/

/** @type BuildOptions */
const baseConfig = {
  bundle: true,
  minify: process.env.NODE_ENV === "production",
  sourcemap: process.env.NODE_ENV !== "production",
};

// Config for extension source code (to be run in a Node-based context)
/** @type BuildOptions */
const extensionConfig = {
  ...baseConfig,
  platform: "node",
  mainFields: ["module", "main"],
  format: "cjs",
  entryPoints: ["./src/extension.ts"],
  outfile: "./out/extension.js",
  watch: process.argv.includes("--watch"),
  plugins: [
    copy({
      resolveFrom: "cwd",
      // dryRun: true,
      // verbose:true,
      assets: [
        {
          from: "./media/RobotoMono.ttf",
          to: "./out",
        },
        // watch: true
      ],
    }),
    clean({ patterns: ["!./out/webview"], verbose: true }),

  ],
  external: ["vscode"],
};




const graphicSimulatorConfig = {
  ...baseConfig,
  target: "es2020",
  format: "esm",
  entryPoints: ["./src/simulators/graphicSimulator/graphicSimulator.ts"],
  outfile: "./out/graphicSimulator.js",
  plugins: [
    copy({
      resolveFrom: "cwd",
      assets: [
        {
          from: "./media/binary-svgrepo-com.svg",
          to: "./out",
        },
      ],
      // watch: true
    }),
  ],
};

const textSimulatorSimulator = {
  ...baseConfig,
  target: "es2020",
  format: "esm",
  entryPoints: ["./src/simulators/textSimulator/textSimulator.ts"],
  outfile: "./out/textSimulator.js",
  plugins: [
    copy({
      resolveFrom: "cwd",
      assets: [
        {
          from: "./media/binary-svgrepo-com.svg",
          to: "./out",
        },
      ],
      // watch: true
    }),
  ],
};

// This watch config adheres to the conventions of the esbuild-problem-matchers
// extension (https://github.com/connor4312/esbuild-problem-matchers#esbuild-via-js)
/** @type BuildOptions */
const watchConfig = {
  watch: {
    onRebuild(error, result) {
      if (error) {
        error.errors.forEach((error) =>
          console.error(
            `> ${error.location.file}:${error.location.line}:${error.location.column}: error: ${error.text}`
          )
        );
      } 
    },
  },
};

// Build script
(async () => {
  const args = process.argv.slice(2);
  try {
    if (args.includes("--watch")) {
      // Keep the React webview bundle fresh alongside the esbuild watchers.
      buildClientWebview({ watch: true });
      // Build and watch extension and webview code
      await build({
        ...extensionConfig,
        ...watchConfig,
      });
      await build({
        ...graphicSimulatorConfig,
        ...watchConfig,
      });
      await build({
        ...textSimulatorSimulator,
        ...watchConfig,
      });
      ("[watch] build finished");
    } else {
      // Build the React webview first, then the extension + simulator bundles.
      buildClientWebview({ watch: false });
      await build(extensionConfig);
      await build(graphicSimulatorConfig);
      await build(textSimulatorSimulator);
    }
  } catch (err) {
    process.stderr.write(err.stderr);
    process.exit(1);
  }
})();
