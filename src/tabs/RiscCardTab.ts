import { WebviewPanel, window, ViewColumn, Uri, Webview } from "vscode";
import { getUri } from "../utilities/getUri";
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
        localResourceRoots: [
          Uri.joinPath(extensionUri, "node_modules"),
          Uri.joinPath(extensionUri, "out")
        ],
      }
    );
    
    const webview = RiscCardPanel.currentPanel.webview;
    RiscCardPanel.setHtmlContent(webview, extensionUri);
  }

  private static setHtmlContent(webview: Webview, extensionUri: Uri) {
    // Se define la ruta del template HTML
    const nonce = getNonce();
    const tailwindCSS = getUri(webview, extensionUri, ["out", "tailwind-output.css"]);
    
    const templatePath = join(extensionUri.fsPath, "src", "templates", "riscCard.html");
    let template = readFileSync(templatePath, "utf-8");
    // Se definen los _placeholders_ y sus valores correspondientes
    const replacements: Record<string, string> = {
      "${tailwindCSS}": tailwindCSS.toString(),
      '${nonce}': nonce,
    };

    // Reemplaza en el template cada placeholder por su valor
    template = template.replace(/\${[^}]+}/g, match => replacements[match] || match);

    webview.html = template;
  }
}




