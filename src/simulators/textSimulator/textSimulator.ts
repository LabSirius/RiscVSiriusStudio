import { provideVSCodeDesignSystem, allComponents } from "@vscode/webview-ui-toolkit";

import { startRelay } from "../shared/relay";

provideVSCodeDesignSystem().register(allComponents);

// The text webview defers the relay until `load`, matching its prior startup.
const vscode = acquireVsCodeApi();
window.addEventListener("load", () => startRelay(vscode), { passive: true });
