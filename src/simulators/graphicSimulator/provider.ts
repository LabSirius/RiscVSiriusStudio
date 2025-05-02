import { Webview, Uri } from "vscode";

import { getNonce } from "../../utilities/getNonce";
import { readFileSync } from "fs";
import { join } from "path";

export async function getHtmlForGraphicSimulator(webview: Webview, extensionUri: Uri) {
  const indexHtmlPath = join(extensionUri.fsPath, "src", "templates", "graphicSimulator", "index.html");
  let html = readFileSync(indexHtmlPath, "utf8");

  const baseUri = webview.asWebviewUri(
    Uri.file(join(extensionUri.fsPath, "src", "templates", "graphicSimulator"))
  );
  html = html.replace("<head>", `<head><base href="${baseUri}/">`);
  const nonce = getNonce();
  const panelviewUri = webview.asWebviewUri(Uri.joinPath(extensionUri, "out", "graphicSimulator.js"));

  html = html.replace(
    "</body>",
    `<script type="module" nonce="${nonce}" src="${panelviewUri}"></script></body>`
  );

  return html;
}
