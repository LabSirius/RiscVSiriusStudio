import { WebviewPanel, window, ViewColumn, Uri, Webview } from "vscode";
import { getUri } from "../../utilities/getUri";
import { readFileSync } from "fs";
import { join } from "path";
import { getNonce } from "../../utilities/getNonce"; 

export class RiscCardPanel {
  public static currentPanel: WebviewPanel | undefined;

  public static riscCard(extensionUri: Uri) {
    if (RiscCardPanel.currentPanel) {
      RiscCardPanel.currentPanel.dispose();
      RiscCardPanel.currentPanel = undefined;
      return;
    }
    RiscCardPanel.currentPanel = window.createWebviewPanel(
      "riscCard",
      "RISC-V Instruction Set",
      ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [
          Uri.joinPath(extensionUri, "node_modules"),
          Uri.joinPath(extensionUri, "src", "templates", "instructionSet") 
        ],
      }
    );
    
    const webview = RiscCardPanel.currentPanel.webview;
    RiscCardPanel.setHtmlContent(webview, extensionUri);
  }

  private static async setHtmlContent(webview: Webview, extensionUri: Uri) {
    const indexHtmlPath = join(extensionUri.fsPath, "src", "templates", "instructionSet", "index.html");
    let html = readFileSync(indexHtmlPath, "utf8");
  
    const baseUri = webview.asWebviewUri(Uri.file(join(extensionUri.fsPath, "src", "templates", "instructionSet")));
    html = html.replace("<head>", `<head><base href="${baseUri}/">`);
  
    const nonce = getNonce();
  
    html = html.replace(
      "</body>",
      `<script type="module" nonce="${nonce}"></script></body>`
    );
  
    webview.html = html;
  }
  
}




