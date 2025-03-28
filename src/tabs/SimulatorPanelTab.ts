import { WebviewPanel, window, ViewColumn, Uri, Webview } from "vscode";
import { getUri } from "../utilities/getUri";
import { readFileSync } from "fs";
import { join } from "path";
import { getNonce } from "../utilities/getNonce"; 

export class SimulatorPanel {
  public static currentPanel: WebviewPanel | undefined;

  public static simulatorPanel(extensionUri: Uri) {
    if (SimulatorPanel.currentPanel) {
      SimulatorPanel.currentPanel.dispose();
      SimulatorPanel.currentPanel = undefined;
      return;
    }
    SimulatorPanel.currentPanel = window.createWebviewPanel(
      "riscCard",
      "RISC-V Instruction Set",
      ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [
          Uri.joinPath(extensionUri, "node_modules"),
          Uri.joinPath(extensionUri, "src", "templates", "simulatorView") 
        ],
      }
    );
    
    const webview = SimulatorPanel.currentPanel.webview;
    SimulatorPanel.setHtmlContent(webview, extensionUri);
  }

  private static async setHtmlContent(webview: Webview, extensionUri: Uri) {
    const indexHtmlPath = join(extensionUri.fsPath, "src", "templates", "simulatorView", "index.html");
    let html = readFileSync(indexHtmlPath, "utf8");
  
    const baseUri = webview.asWebviewUri(Uri.file(join(extensionUri.fsPath, "src", "templates", "simulatorView")));
    html = html.replace("<head>", `<head><base href="${baseUri}/">`);
  
    const nonce = getNonce();
  
    html = html.replace(
      "</body>",
      `<script type="module" nonce="${nonce}"></script></body>`
    );
  
    webview.html = html;
  }
  
}




