import { WebviewPanel, window, ViewColumn, Uri, Webview } from "vscode";
import { readFileSync } from "fs";
import { join } from "path";
import { getNonce } from "../utilities/getNonce"; // Función para generar un nonce

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
        localResourceRoots: [Uri.joinPath(extensionUri, "node_modules")],
      }
    );
    const webview = RiscCardPanel.currentPanel.webview;
    RiscCardPanel.setHtmlContent(webview, extensionUri);
  }

  private static setHtmlContent(webview: Webview, extensionUri: Uri) {
    // Se define la ruta del template HTML
    const templatePath = join(extensionUri.fsPath, "src", "templates", "riscCard.html");
    let template = readFileSync(templatePath, "utf-8");

    // Se obtienen las URIs de los recursos (Bootstrap CSS y JS, etc.)
    const bootstrapCSS = webview.asWebviewUri(
      Uri.joinPath(extensionUri, "node_modules", "bootstrap", "dist", "css", "bootstrap.min.css")
    );
    const bootstrapJS = webview.asWebviewUri(
      Uri.joinPath(extensionUri, "node_modules", "bootstrap", "dist", "js", "bootstrap.bundle.min.js")
    );
    const nonce = getNonce();

    // Se definen los _placeholders_ y sus valores correspondientes
    const replacements: Record<string, string> = {
      '${bootstrapCSS}': bootstrapCSS.toString(),
      '${bootstrapJS}': bootstrapJS.toString(),
      '${nonce}': nonce,
    };

    // Reemplaza en el template cada placeholder por su valor
    template = template.replace(/\${[^}]+}/g, match => replacements[match] || match);

    webview.html = template;
  }
}




