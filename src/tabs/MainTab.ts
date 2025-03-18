import { WebviewViewProvider, WebviewView, Webview, Uri, EventEmitter, window } from "vscode";
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";
import { logger } from "../utilities/logger";
import { readFileSync } from "fs";
import { join } from "path";
import { RVContext } from "../support/context";



// We extract the html that will be connected to the extension
export async function getHtmlForRegistersWebview(webview: Webview, extensionUri: Uri) {
  const indexHtmlPath = join(extensionUri.fsPath, "out", "webview", "index.html");
  let html = readFileSync(indexHtmlPath, "utf8");

  const baseUri = webview.asWebviewUri(Uri.file(join(extensionUri.fsPath, "out", "webview")));
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
