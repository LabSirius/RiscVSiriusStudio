import { provideVSCodeDesignSystem, allComponents } from "@vscode/webview-ui-toolkit";

import { startRelay } from "../shared/relay";

provideVSCodeDesignSystem().register(allComponents);

// The graphic webview starts the relay immediately on script eval.
startRelay(acquireVsCodeApi());
