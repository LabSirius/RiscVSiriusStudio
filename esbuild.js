const { build } = require("esbuild");
const { copy } = require("esbuild-plugin-copy");
const { clean } = require("esbuild-plugin-clean");

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
      // Build and watch extension and webview code
      await build({
        ...extensionConfig,
        ...watchConfig,
      });
      await build({
        ...simulatorviewConfig,
        ...watchConfig,
      });
      await build({
        ...registersviewConfig,
        ...watchConfig,
      });
      await build({
        ...registersviewConfigTextSimulator,
        ...watchConfig,
      });
      ("[watch] build finished");
    } else {
      // Build extension and webview code
      await build(extensionConfig);
      await build(graphicSimulatorConfig);
      await build(textSimulatorSimulator);
    }
  } catch (err) {
    process.stderr.write(err.stderr);
    process.exit(1);
  }
})();
