import { Webview, Uri,  } from "vscode";

import { getNonce } from "../utilities/getNonce";
import { readFileSync } from "fs";
import { join } from "path";
import { logger } from "../utilities/logger";
import { RVContext } from "../support/context";
import { RVDocument } from "../rvDocument";


export async function getHtmlForRegistersWebview(webview: Webview, extensionUri: Uri) {
  const indexHtmlPath = join(extensionUri.fsPath, "src", "templates", "panelView", "index.html");
  let html = readFileSync(indexHtmlPath, "utf8");

  const baseUri = webview.asWebviewUri(Uri.file(join(extensionUri.fsPath, "src", "templates", "panelView")));
  html = html.replace("<head>", `<head><base href="${baseUri}/">`);
  const nonce = getNonce();
  const panelviewUri = webview.asWebviewUri(Uri.joinPath(extensionUri, "out", "panelview.js"));

  html = html.replace("</body>", `<script type="module" nonce="${nonce}" src="${panelviewUri}"></script></body>`);

  return html;
}


export async function activateMessageListenerForRegistersView(
  webview: Webview,
  context: RVContext
) {
  webview.onDidReceiveMessage((message: any) => {
    switch (message.command) {
      case "log":
        console.log( message.object);
        break;
      case "event":
        console.log(message.object);
        context.dispatchMainViewEvent(message.object);
        break;
      default:
        console.log(message);
        logger().info("info", message.obj);
        break;
    }
  });
}