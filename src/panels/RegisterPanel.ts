import { WebviewViewProvider, WebviewView, Webview, Uri, EventEmitter, window } from "vscode";
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";
import { logger } from "../utilities/logger";
import { readFileSync } from "fs";
import { join } from "path";
import { RVContext } from "../support/context";

export async function getHtmlForRegistersWebview(webview: Webview, extensionUri: Uri) {
  const panelviewUri = getUri(webview, extensionUri, ["out", "panelview.js"]);
  const nonce = getNonce();
  const tabulatorCSS = getUri(webview, extensionUri, ["out", "tabulator.min.css"]);
  const tailwindCSS = getUri(webview, extensionUri, ["out", "tailwind-output.css"]);

  const templatePath = join(extensionUri.fsPath, "src", "templates", "registersView.html");
  const template = readFileSync(templatePath, "utf-8");
  const replacements: Record<string, string> = {
    "${panelviewUri}": panelviewUri.toString(),
    "${nonce}": nonce,
    "${tabulatorCSS}": tabulatorCSS.toString(),
    "${tailwindCSS}": tailwindCSS.toString(),
  };
  return template.replace(/\${[^}]+}/g, (match) => replacements[match] || match);
}

export async function activateMessageListenerForRegistersView(
  webview: Webview,
  context: RVContext
) {
  webview.onDidReceiveMessage((message: any) => {
    switch (message.command) {
      case "log":
        console.log(`%c[RegistersView-${message.level}]\n`, "color:orange", message.object);
        break;
      case "event":
        console.log(`%c[RegistersView-event]\n`, "color:green", message.object);
        context.dispatchMainViewEvent(message.object);
        break;
      default:
        console.log(`%c[RegistersView-unrecognized]\n`, "color:red", message);
        logger().info("info", message.obj);
        break;
    }
  });
}
