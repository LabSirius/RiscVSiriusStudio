import {
  WebviewViewProvider,
  WebviewView,
  Webview,
  Uri,
  EventEmitter,
  window
} from 'vscode';
import { getUri } from '../utilities/getUri';
import { getNonce } from '../utilities/getNonce';
import { logger } from '../utilities/logger';

export class DataMemPanelView implements WebviewViewProvider {
  public static currentview: DataMemPanelView | undefined;

  private constructor(
    private readonly extensionUri: Uri,
    private data: any,
    private _view: any = null
  ) {
    this.extensionUri = extensionUri;
  }
  public static render(extensionUri: Uri, data: any): DataMemPanelView {
    if (!DataMemPanelView.currentview) {
      DataMemPanelView.currentview = new DataMemPanelView(extensionUri, data);
    }
    return DataMemPanelView.currentview;
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
      localResourceRoots: [this.extensionUri]
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
        case 'log-info':
          logger().info('info', message.obj);
          break;

        case 'SHOW_WARNING_LOG':
          window.showWarningMessage(message.data.message);
          break;
        default:
          break;
      }
    });
  }

  private _getHtmlForWebview(webview: Webview, extensionUri: Uri) {
    const dataMemoryUri = getUri(webview, extensionUri, [
      'out',
      'datamemview.js'
    ]);
    const nonce = getNonce();
    const tabulatorCSS = getUri(webview, extensionUri, [
      'out',
      'tabulator.min.css'
    ]);
    const panelsCSS = getUri(webview, extensionUri, ['out', 'panels.css']);

    const bootstrapCSS = webview.asWebviewUri(
      Uri.joinPath(
        extensionUri,
        'node_modules',
        'bootstrap',
        'dist',
        'css',
        'bootstrap.min.css'
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
        <div class="alert alert-secondary mt-2" id="datamem-cover">
        <h4>Data memory</h4>
        <p> This will be available only during simulation.</p>
        </div>
        <div class="overflow-hidden" id="datamem-table" style="margin-top:1rem;"></div>
        <script type="module" nonce="${nonce}" src="${dataMemoryUri}"></script>
        </body>
      </html>`;
  }
}
