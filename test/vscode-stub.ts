/**
 * Minimal `vscode` module stub for headless Vitest runs.
 *
 * Production modules on the CPU import path (e.g. `logger.ts`) statically
 * import `vscode`, which only exists inside the extension host. The golden
 * integration tests construct the CPUs headless, so `vscode` is aliased to
 * this stub in `vitest.config.ts`. Only the members touched at module load or
 * on the exercised code paths need to exist; everything else is a no-op.
 */

const outputChannel = new Proxy(
  {},
  {
    get() {
      return () => {};
    },
  }
);

export const window = {
  createOutputChannel: () => outputChannel,
};

export class LogOutputChannel {}
