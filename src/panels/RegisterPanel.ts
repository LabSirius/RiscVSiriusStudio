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
      <html>
        <head>
          <meta charSet="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet", href="${tailwindCSS}">
          <link rel="stylesheet", href="${tabulatorCSS}">
          <!-- <script src="https://cdn.tailwindcss.com"></script> -->
          <link href="${pagedoneCSS}" rel="stylesheet"/>
        </head>
        <body>
          <div class="w-full flex justify-center w-xl mx-auto gap-2 ">
            <div class="flex w-2/5 max-h-dvh rounded-lg bg-indigo-600 transition-all duration-700 hover:flex-grow">
              <div id="tabs-registers" class="w-fit"></div>
              <!--
              <img alt="daisy" src="https://img.daisyui.com/images/stock/photo-1560717789-0ac7c58ac90a.webp" />
              -->
            </div>
            <div class="flex min-w-60 w-3/5 max-h-dvh gap-2 rounded-lg">
              <div id="tabs-memory" class="w-11/12"></div>
              <div class="flex flex-col w-1/12 px-1 border border-solid border-gray-200 divide-y">
                  <!-- Address lookup -->
                  <div>
                    <div class="flex flex-row gap-8 h-7" style="align-items: baseline;">
                        <label class="flex w-fit text-gray-600 text-xs">Address lookup</label>
                        <select 
                        class="flex flex-1 h-full rounded-lg text-xs font-semibold text-gray-900">
                        <option selected>Options.</option>
                        <option value="bin">Binary</option>
                        <option value="hex">Hex.</option>
                        <option value="dec">Decimal</option>
                        <option value="ascii-7">Ascii-7</option>
                      </select>
                    </div>
                  <div class="flex flex-row justify-between w-full h-7 gap-3">
                    <input type="text" id="default-search"
                      class="flex border pl-2 text-sm font-normal shadow-xs font-semibold text-gray-900 bg-transparent placeholder-gray-400"
                      placeholder="0xFF" required="">
                    
                    <button
                      class="h-full px-2 border shadow-xs text-xs font-semibold text-gray-900 transition-all duration-500 hover:bg-gray-300">Find</button>
                  </div>
                  </div>
                  <!-- Data display -->
                  <div class="mt-2">
                    <label class="flex mt-2 text-gray-600 text-xs font-medium">Selection</label>
                    <label class="flex mt-2 text-gray-600 text-xs font-medium"> nothing</label>
                  </div>
              </div>
              <!--
              <img alt="daisy" src="https://img.daisyui.com/images/stock/photo-1560717789-0ac7c58ac90a.webp" />
              -->
              </div>
          </div>
          <script src="${pagedoneUri}"></script>
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
