import {
  WebviewViewProvider,
  WebviewView,
  Webview,
  Uri,
  EventEmitter,
  window,
} from "vscode";
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";
import { logger } from "../utilities/logger";

export async function getHtmlForRegistersWebview(webview: Webview, extensionUri: Uri) {
  const registersviewUri = getUri(webview, extensionUri, [
    "out",
    "registersview.js",
  ]);
  const nonce = getNonce();

  const tabulatorCSS = getUri(webview, extensionUri, [
    "out",
    "tabulator.min.css",
  ]);

  const tailwindCSS = getUri(webview, extensionUri, ["out", "tailwind-output.css"]);

  const pagedoneCSS = webview.asWebviewUri(
    Uri.joinPath(
      extensionUri,
      'node_modules',
      'pagedone',
      'src',
      'css',
      'pagedone.css'
    )
  );

  const pagedoneUri = webview.asWebviewUri(
    Uri.joinPath(
      extensionUri,
      'node_modules',
      'pagedone',
      'src',
      'js',
      'pagedone.js'
    )
  );


  // TODO: Change data-theme to take into account current vscode theme.
  return /*html*/`
      <html data-theme="light">
        <head>
          <meta charSet="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet", href="${tailwindCSS}">
          <link rel="stylesheet", href="${tabulatorCSS}">
          <!-- <script src="https://cdn.tailwindcss.com"></script> -->
          <!-- <link href="${pagedoneCSS}" rel="stylesheet"/> -->
        </head>
        <body>
          <div class="w-full flex flex-row gap-3">
            <div id="tabs-registers" class="w-fit max-h-dvh min-h-dvh"></div>
            <div id="tabs-memory" class="w-fit max-h-dvh min-h-dvh "></div>
            <div class="flex flex-col">

              <div class="flex items-center justify-between">
                <input type="text" placeholder="Search" class="block border" />
                <div class="flex items-center">
                  <input type="checkbox" id="scales" name="scales" checked/>
                  <label class="select-none">Registers</label> 
                </div>
                <div class="flex items-center">
                  <input type="checkbox" id="" name="scales" checked/>
                  <label class="select-none">Memory</label> 
                </div>
              </div>

              <div>
                <select class="block p-2">
                  <option value=""></option>
                  <option value="">Bin.</option>
                  <option value="">Hex.</option>
                  <option value="">Dec.</option>
                  <option value="">ASCII-7</option>
                </select>
              </div>
              <!-- <div>Hola</div> -->
            </div>
          </div>
          <!-- <script src="${pagedoneUri}"></script> -->
          <script type="module" nonce="${nonce}" src="${registersviewUri}"></script>
        </body>
      </html>`;
}

export async function activateMessageListenerForRegistersView(webview: Webview) {
  console.log("Activating listener on registers view");
  webview.onDidReceiveMessage((message: any) => {
    switch (message.command) {
      case "log":
        console.log(`%c[RegistersView-${message.level}]\n`, 'color:orange', message.object);
        break;
      default:
        console.log(`%c[RegistersView-unrecognized]\n\t${message.obj}`, 'color:red');
        logger().info("info", message.obj);
        break;
    }
  });
}

export class RegisterPanelView implements WebviewViewProvider {
  public static currentview: RegisterPanelView | undefined;

  private constructor(
    private readonly extensionUri: Uri,
    private data: any,
    private _view: any = null
  ) {
    this.extensionUri = extensionUri;
  }
  public static render(extensionUri: Uri, data: any): RegisterPanelView {
    if (!RegisterPanelView.currentview) {
      RegisterPanelView.currentview = new RegisterPanelView(extensionUri, data);
    }
    return RegisterPanelView.currentview;
  }

  public getWebView(): Webview {
    return (this._view as WebviewView).webview;
  }

  private onDidChangeTreeData: EventEmitter<any | undefined | null | void> =
    new EventEmitter<any | undefined | null | void>();

  refresh(context: any): void {
    this.onDidChangeTreeData.fire(null);
    this._view.webview.html = this._getHtmlForWebview(
      this._view?.webview,
      this.extensionUri
    );
  }

  //called when a view first becomes visible
  resolveWebviewView(webviewView: WebviewView): void | Thenable<void> {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri],
    };
    webviewView.webview.html = this._getHtmlForWebview(
      webviewView.webview,
      this.extensionUri
    );
    this._view = webviewView;
    this.activateMessageListener();
  }

  private activateMessageListener() {
    this._view.webview.onDidReceiveMessage((message: any) => {
      switch (message.command) {
        case "log-info":
          logger().info("info", message.obj);
          break;

        case "SHOW_WARNING_LOG":
          window.showWarningMessage(message.data.message);
          break;
        default:
          break;
      }
    });
  }

  private _getHtmlForWebview(webview: Webview, extensionUri: Uri) {
    const registerswUri = getUri(webview, extensionUri, [
      "out",
      "registersview.js",
    ]);
    const nonce = getNonce();
    const tabulatorCSS = getUri(webview, extensionUri, [
      "out",
      "tabulator.min.css",
    ]);
    const panelsCSS = getUri(webview, extensionUri, ["out", "panels.css"]);

    const bootstrapCSS = webview.asWebviewUri(
      Uri.joinPath(
        extensionUri,
        "node_modules",
        "bootstrap",
        "dist",
        "css",
        "bootstrap.min.css"
      )
    );

    return `
      <html>
        <head>
          <link rel="stylesheet", href="${bootstrapCSS}">
          <link rel="stylesheet", href="${tabulatorCSS}">
          <link rel="stylesheet", href="${panelsCSS}">
          <meta charSet="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
        <div class="alert alert-secondary mt-2" id="registers-cover">
        <h4>Registers Unit</h4>
        <p> This will be available only during simulation.</p>
        </div>
        <script type="module" nonce="${nonce}" src="${registerswUri}"></script>
        <div id="registers-table" style="margin-top:1rem;"></div>
        </body>
      </html>`;
  }
}
