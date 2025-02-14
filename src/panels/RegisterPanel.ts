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
          <div class="w-full flex flex-row gap-3 overflow-hidden">
            <div id="tabs-registers" class="w-fit max-h-dvh min-h-dvh"></div>
            <div id="tabs-memory" class="w-fit max-h-dvh min-h-dvh"></div>
            <!-- This is the third column -->

            <div class=" flex flex-col gap-2 flex-1 max-h-dvh min-h-dvh overflow-y-scroll">
              <div class="flex justify-between items-center gap-2  ">
                <div class="flex gap-2">
                  <div id="openSearchButton" class="icon-tab">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  </div>
                  <div id="openImportButton" class="icon-tab">
                    <div class="flex gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-down"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-up"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M12 12v6"/><path d="m15 15-3-3-3 3"/></svg>
                    </div>
                  </div>
                  <div id="openConvertButton" class="icon-tab">
                    <div class="flex gap-2 items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calculator"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>
                      <p>Convert</p>
                    </div>
                  </div>
                  <div id="openSettingsButton" class="icon-tab">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                  
                  </div>
                </div>
                 <div id="openHelpButton" class="icon-tab">
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                 </div>
              </div>

               <div id="thirdMainColumn" class="flex flex-1 ">
                  <div class="flex flex-col p-4">
                    <p class="title">Search values</p>
                    <div class="flex flex-col gap-4 mt-2"> 
                      <div class="flex flex-col gap-1 ">
                        <p class="label">In registers table</p>
                        <div class="relative">
                          <div class="icon-input">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
                          </div>
                        <input type="text" id="searchRegisterInput" placeholder="e.g x17 or b101 or d23 ..." class="input-filter"/>
                        </div>
                      </div>

                      <div class="flex flex-col gap-1 ">
                        <p class="label">In memory table</p>
                        <div class="relative">
                          <div class="icon-input">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-save"><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/></svg>
                          </div>
                        <input type="text" id="searchMemoryInput" placeholder="e.g 1234" class="input-filter"/>
                        </div>
                      </div>
                      <p class="text-gray mt-3">If you have any. question, click on the information icon.</p>
                    </div>
                  </div>

          
                </div>

                <div id="openImport" class="hidden">
                  <div class="flex flex-col gap-2  p-4">
                     <p class="title">Import / Export data</p>

                    <div class="flex flex-col gap-2">
                      <p class="text-lg font-semibold text-primary">Import data</p>
                      <div class="flex flex-col gap-2">
                        <input type="file" id="fileInputImportRegister" accept=".txt" class="hidden"/>
                        <div class="flex gap-2 items-center">
                          <div class="icon-tab"  id="importRegisterBtn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-down"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>
                          </div>
                          <p class="text-gray">Register data</p>
                        </div>
                        
                        <input type="file" id="fileInputImportMemory" accept=".txt" class="hidden"/>
                        <div class="flex gap-2 items-center">
                          <div class="icon-tab" id="importMemoryBtn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-save"><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/></svg>
                          </div>
                          <p class="text-gray">Memory data</p>
                        </div>
                      </div>
                    </div>

                    <div class="flex flex-col gap-2 mt-3">
                      <p class="text-lg font-semibold text-primary">Export data</p>
                      <div class="flex flex-col gap-2">
                        <input type="file" id="fileInputExportRegister" accept=".txt" class="hidden"/>
                        <div class="flex gap-2 items-center">
                          <div class="icon-tab"  id="exportRegisterBtn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-up"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M12 12v6"/><path d="m15 15-3-3-3 3"/></svg>
                          </div>
                          <p class="text-gray">Register data</p>
                        </div>
                        
                        <input type="file" id="fileInputExportMemory" accept=".txt" class="hidden"/>
                        <div class="flex gap-2 items-center">
                          <div class="icon-tab" id="exportMemoryBtn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-save"><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/></svg>
                          </div>
                          <p class="text-gray">Memory data</p>
                        </div>
                      </div>
                    </div>

                    
                  </div>
                </div>

                <div id="openConvert" class="hidden">
                  <div class="flex flex-col gap-4  w-min p-4">
                    <p class="title">Convert values</p>
                    <div class="flex gap-2">
                      <div class="flex flex-col gap-1 relative">
                        <p class="label"> From </p>
                        <div class="relative">
                          <input type="text" id="fromConvertInput" class="input-base-convert" readonly />
                          <div class="icon-input-right">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
                          </div>
                        </div>
                        
                        <div id="fromOptions" class="hidden">
                          <div  class="options-convert">
                            <p class="option-convert" data-value="bin">Binary</p>
                            <p class="option-convert" data-value="hex">Hexadecimal</p>
                            <p class="option-convert" data-value="dec">Decimal</p>
                             <p class="option-convert" data-value="twoCompl">Two's complement</p>
                          </div>
                        </div>

                      </div>
                      <div class="flex flex-col gap-1 relative">
                        <p class="label"> To </p>
                        <div class="relative">
                          <input type="text" id="toConvertInput" class="input-base-convert" readonly />
                          <div class="icon-input-right">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
                          </div>
                        </div>
                        <div id="toOptions" class="hidden">
                          <div class="options-convert">
                            <p class="option-convert" data-value="bin">Binary</p>
                            <p class="option-convert" data-value="hex">Hexadecimal</p>
                            <p class="option-convert" data-value="dec">Decimal</p>
                            <p class="option-convert" data-value="twoCompl">Two's complement</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="flex flex-col gap-1">
                      <p class="label"> Value </p>
                      <div class="relative">
                        <div class="icon-input">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hash"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>
                        </div>  
                        <input type="text" id="numberToconvertInput" class="input-value-convert" />
                      </div>
                    </div>

                    <div class="flex gap-2 justify-end ">
                      <button class="swapButton" id="SwapConvertBtn">Swap</button>
                    </div>

                    <div class="flex flex-col gap-2">
                      <p class="label">Result :</p>
                      <input type="text" id="resultConvertInput" class="input-convert-result" readonly />
                    </div>
                  </div>
                </div>


                <div id="openHelp" class="hidden">
                  <div class=" p-4">
                   <p class="title">Help</p>
                    <div class="help-container">
                      <!-- Import Section -->
                      <div class="help-section mt-3">
                        <div class="help-header">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-down"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>
                          <p class="help-title">Import Registers Table</p>
                        </div>
                        <p class="help-description">
                          To import a file, it must be <strong>.txt</strong>. The records should be in binary, meaning the file must contain 
                          <strong>32 lines</strong>, where each line has <strong>32 bits</strong>.
                        </p>
                      </div> 

                      <div class="help-section">
                        <div class="help-header">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>  
                          <p class="help-title">Filter Data in Register Table</p>
                        </div>
                        <p class="help-description">
                          You can search by register name, or if you need to search for a value, the following formats will be displayed:
                        </p>
                        
                        <ul class="help-filter-list mt-1">
                          <li><span class="help-filter-key">b</span>xxxx → Binary (n bits)</li>
                          <li><span class="help-filter-key">d</span>xxxx → Decimal (+/-)</li>
                          <li><span class="help-filter-key">h</span>xxxx → Hexadecimal</li>
                          <li><span class="help-filter-key">s</span>xxxx → Signed (+/- in 32 bits)</li>
                          <li><span class="help-filter-key">u</span>xxxx → Unsigned (+)</li>
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
