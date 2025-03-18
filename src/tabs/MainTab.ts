import { Webview, Uri } from "vscode";
import { readFileSync } from "fs";
import { join } from "path";


export async function getHtmlForRegistersWebview(webview: Webview, extensionUri: Uri) {
  const indexHtmlPath = join(extensionUri.fsPath, "out", "webview", "index.html");
  let html = readFileSync(indexHtmlPath, "utf8");
  const baseUri = webview.asWebviewUri(Uri.file(join(extensionUri.fsPath, "out", "webview"))).toString();
  html = html.replace("<head>", `<head><base href="${baseUri}/">`);
  
  return html;
}

export async function activateMessageListenerForRegistersView(
  webview: Webview,
  context: any
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
        break;
    }
  });
}
