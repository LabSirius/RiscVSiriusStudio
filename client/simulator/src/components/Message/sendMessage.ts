import type { WebviewMessage } from "@protocol/messages";

interface SendMessageProps {
  event: string;
  [key: string]: unknown;
}

/**
 * Loose webview→extension sender for control/navigation events (step, stop,
 * webviewReady, clickInInstruction, …) whose shapes are not part of the typed
 * contract. State-mutating edits go through {@link sendWebviewMessage} instead.
 */
export const sendMessage = ({event, ...data} : SendMessageProps) => {

  window.postMessage({ from:"react", event: event, ...data }, '*');
  return
}

/**
 * Typed webview→extension sender for the contract's reverse direction: the
 * state-mutating {@link WebviewMessage} union (register edit, memory edit,
 * reset). Dropping or renaming a field on one of these is a compile error here,
 * matching the inbound guarantee `parseExtensionMessage` gives (ticket 06).
 */
export const sendWebviewMessage = (message: WebviewMessage) => {
  window.postMessage({ from: "react", ...message }, "*");
};
