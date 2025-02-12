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

  return /*html*/`
      <html data-theme="light">
        <head>
          <meta charSet="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet", href="${tailwindCSS}">
          <link rel="stylesheet", href="${tabulatorCSS}">
        </head>
        <body>
          <div class="w-full flex flex-row gap-3">
            <div id="tabs-registers" class="w-fit max-h-dvh min-h-dvh"></div>
            <div id="tabs-memory" class="w-fit max-h-dvh min-h-dvh"></div>
            <!-- This is the third column -->
            <div class=" flex flex-col gap-2 flex-1">

              <div class="flex justify-between items-center">
                <div class="flex gap-2">
                  <button id="openSearchButton" class="btn p-2">Search</button>
                  <button id="openImportButton" class="btn p-2">Import / Export Data</button>
                  <button id="openConvertButton" class="btn p-2">Convert</button>
                 
                </div>
                 <button id="openHelpButton" class="btn p-2">Help</button>
              </div>

               <div id="thirdMainColumn" class="flex flex-1"> 
                  <div class="flex flex-col">
                    <div class="flex flex-col gap-2 mt-3">
                      <p>Search values in registers table</p>
                      <input type="text" id="searchRegisterInput" placeholder="e.g x17 or b101 or d23 ..." class="px-3 pl-4 border rounded flex-grow w-min"/>
                    </div>

                    <div class="flex flex-col gap-2 mt-3">
                      <p>Search values in memory table</p>
                      <input type="text" id="searchMemoryInput" placeholder="e.g 1234" class="px-3 pl-4 border rounded flex-grow w-min"/>
                    </div>
                  </div>

          
                </div>

                <div id="openImport" class="hidden">
                  <div class="flex flex-col gap-2 mt-3">
                    <div class="flex flex-col gap-2">
                      <p class="text-lg font-semibold">Import data</p>
                      <div class="flex gap-2 items-center">
                        <input type="file" id="fileInputImportRegister" accept=".txt" class="hidden"/>
                        <button class="btn p-2" id="importRegisterBtn">Import register table</button>
                        <p class="text-md mx-2">or</p>
                        <input type="file" id="fileInputImportMemory" accept=".txt" class="hidden"/>
                        <button class="btn p-2" id="importMemoryBtn">Import memory table</button>
                      </div>
                    </div>
                    <div class="flex flex-col gap-2 mt-3">
                      <p class="text-lg font-semibold">Export data</p>
                      <div class="flex gap-2 items-center">
                        <input type="file" id="fileInputExportRegister" accept=".txt" class="hidden"/>
                        <button class="btn p-2" id="exportRegisterBtn">Export register table</button>
                        <p class="text-md mx-2">or</p>
                        <input type="file" id="fileInputExportMemory" accept=".txt" class="hidden"/>
                        <button class="btn p-2" id="exportMemoryBtn">Export memory table</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div id="openConvert" class="hidden">
                  <div class="flex flex-col gap-4 mt-3 w-min">
                    <div class="flex gap-2">
                      <div class="flex flex-col gap-1 relative">
                        <p> From </p>
                        <input type="text" id="fromConvertInput" class="px-3 pl-4 border rounded  cursor-pointer" readonly />
                        
                        <div id="fromOptions" class="hidden">
                          <div  class="absolute mt-1  border rounded bg-white p-2 flex flex-col gap-2">
                            <p class="optionConvert" data-value="bin">Binary</p>
                            <p class="optionConvert" data-value="hex">Hexadecimal</p>
                            <p class="optionConvert" data-value="dec">Decimal</p>
                          </div>
                        </div>

                      </div>
                      <div class="flex flex-col gap-1 relative">
                        <p> To </p>
                        <input type="text" id="toConvertInput" class="px-3 pl-4 border rounded cursor-pointer" readonly />
                        <div id="toOptions" class="hidden">
                          <div class="absolute mt-1  border rounded bg-white p-2 flex flex-col gap-2">
                            <p class="optionConvert" data-value="bin">Binary</p>
                            <p class="optionConvert" data-value="hex">Hexadecimal</p>
                            <p class="optionConvert" data-value="dec">Decimal</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="flex flex-col gap-1">
                      <p> Number </p>
                      <input type="text" id="numberToconvertInput" class="px-3 pl-4 border rounded" />
                    </div>

                    <div class="flex gap-2 ">
                      <button class="btn bg-green p-2" id="ConvertBtn">Convert</button>
                      <button class="btn p-2" id="SwapConvertBtn">Swap</button>
                    </div>

                    <div class="flex gap-2 items-center">
                      <p>Result :</p>
                      <input type="text" id="resultConvertInput" class="px-2" readonly />
                    </div>
                  </div>
                </div>


                <div id="openHelp" class="hidden">
                  <div class=" rounded p-5 border mt-3 p-4">
                    <div class="flex flex-col gap-4">
                      
                    
                      <div class="flex flex-col gap-2">
                        <p class="text-lg font-semibold">📥 Import Registers Table</p>
                        <p>
                          To import a file, it must be <strong>.txt</strong>. The records should be in binary, meaning the file must contain 
                          <strong>32 lines</strong>, where each line has <strong>32 bits</strong>.
                        </p>
                      </div> 

                    
                      <div class="flex flex-col gap-2">
                        <p class="text-lg font-semibold">🔍 Filter Data in Register Table</p>
                        <p>
                          You can search by register name, or if you need to search for a value, the following formats will be displayed:
                        </p>
                        
                        <ul class="bg-gray-100 p-3 rounded border p-2">
                          <li><span class="font-semibold text-blue-600">b</span>xxxx → Binary (n bits)</li>
                          <li><span class="font-semibold text-blue-600">d</span>xxxx → Decimal (+/-)</li>
                          <li><span class="font-semibold text-blue-600">h</span>xxxx → Hexadecimal</li>
                          <li><span class="font-semibold text-blue-600">s</span>xxxx → Signed (+/- in 32 bits)</li>
                          <li><span class="font-semibold text-blue-600">u</span>xxxx → Unsigned (+)</li>
                        </ul>
                      </div>

                    </div>
                  </div>
                </div>


            </div>
          </div>
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
