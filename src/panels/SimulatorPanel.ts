import {
  Disposable,
  Webview,
  WebviewPanel,
  window,
  Uri,
  ViewColumn
} from 'vscode';
import { getUri } from '../utilities/getUri';
import { getNonce } from '../utilities/getNonce';
import { logger } from '../utilities/logger';

/**
 * This class manages the state and behavior of HelloWorld webview panels.
 *
 * It contains all the data and methods for:
 *
 * - Creating and rendering HelloWorld webview panels
 * - Properly cleaning up and disposing of webview resources when the panel is closed
 * - Setting the HTML (and by proxy CSS/JavaScript) content of the webview panel
 * - Setting message listeners so data can be passed between the webview and extension
 */
export class SimulatorPanel {
  public static currentPanel: SimulatorPanel | undefined;
  private readonly _panel: WebviewPanel;
  private _disposables: Disposable[] = [];

  /**
   * The SimulatorPanel class private constructor (called only from the render method).
   *
   * @param panel A reference to the webview panel
   * @param extensionUri The URI of the directory containing the extension
   */
  private constructor(panel: WebviewPanel, extensionUri: Uri) {
    this._panel = panel;

    // Set an event listener to listen for when the panel is disposed (i.e. when the user closes
    // the panel or when the panel is closed programmatically)
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Set the HTML content for the webview panel
    this._panel.webview.html = this._getWebviewContent(
      this._panel.webview,
      extensionUri
    );

    // Set an event listener to listen for messages passed from the webview context
    this._setWebviewMessageListener(this._panel.webview);
  }

  public getWebView(): Webview {
    return this._panel.webview;
  }

  public static getPanel(extensionUri: Uri) {
    SimulatorPanel.render(extensionUri);
    return SimulatorPanel.currentPanel;
  }

  /**
   * Renders the current webview panel if it exists otherwise a new webview panel
   * will be created and displayed.
   *
   * @param extensionUri The URI of the directory containing the extension.
   */
  public static render(extensionUri: Uri) {
    SimulatorPanel.create(extensionUri);
    SimulatorPanel.currentPanel?._panel.reveal(ViewColumn.One);
  }

  public static create(extensionUri: Uri) {
    if (!SimulatorPanel.currentPanel) {
      // If a webview panel does not already exist create and show a new one
      const panel = window.createWebviewPanel(
        // Panel view type
        'showHelloWorld',
        // Panel title
        'RISCV simulator',
        // The editor column the panel should be displayed in
        { viewColumn: ViewColumn.One, preserveFocus: true },
        {
          enableScripts: true,
          localResourceRoots: [
            Uri.joinPath(extensionUri, 'out'),
            Uri.joinPath(extensionUri, 'node_modules') // Required for codicon
          ],
          retainContextWhenHidden: true
        }
      );

      SimulatorPanel.currentPanel = new SimulatorPanel(panel, extensionUri);
    }
  }

  /**
   * Cleans up and disposes of webview resources when the webview panel is closed.
   */
  public dispose() {
    SimulatorPanel.currentPanel = undefined;

    // Dispose of the current webview panel
    this._panel.dispose();

    // Dispose of all disposables (i.e. commands) associated with the current webview panel
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  /**
   * Defines and returns the HTML that should be rendered within the webview panel.
   *
   * @remarks This is also the place where *references* to CSS and JavaScript files
   * are created and inserted into the webview HTML.
   *
   * @param webview A reference to the extension webview
   * @param extensionUri The URI of the directory containing the extension
   * @returns A template string literal containing the HTML that should be
   * rendered within the webview panel
   */
  private _getWebviewContent(webview: Webview, extensionUri: Uri) {
    const webviewUri = getUri(webview, extensionUri, [
      'out',
      'simulatorview.js'
    ]);
    const nonce = getNonce();
    const cssFile = getUri(webview, extensionUri, ['out', 'styles.css']);

    const codiconsUri = webview.asWebviewUri(
      Uri.joinPath(
        extensionUri,
        'node_modules',
        '@vscode/codicons',
        'dist',
        'codicon.css'
      )
    );

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

    const svgString = /*html*/ `
      <?xml version="1.0" encoding="UTF-8"?>
      <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
      <svg
        id="main-svg"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        version="1.1"
        height="100%"
        width="100%"
        viewBox="-0.5 -0.5 1051 529"
        style="background-color: rgb(255, 255, 255);"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <style type="text/css">
            @import url(https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500);&#xa;@import url(https://fonts.googleapis.com/css2?family=Roboto:wght@400;500);&#xa;
          </style>
          <style xmlns="http://www.w3.org/1999/xhtml" id="MJX-SVG-styles">
            &#xa;mjx-container[jax="SVG"] {&#xa;  direction: ltr;&#xa;}&#xa;&#xa;mjx-container[jax="SVG"] &gt; svg {&#xa;  overflow: visible;&#xa;  min-height: 1px;&#xa;  min-width: 1px;&#xa;}&#xa;&#xa;mjx-container[jax="SVG"] &gt; svg a {&#xa;  fill: blue;&#xa;  stroke: blue;&#xa;}&#xa;&#xa;mjx-container[jax="SVG"][display="true"] {&#xa;  display: block;&#xa;  text-align: center;&#xa;  margin: 1em 0;&#xa;}&#xa;&#xa;mjx-container[jax="SVG"][display="true"][width="full"] {&#xa;  display: flex;&#xa;}&#xa;&#xa;mjx-container[jax="SVG"][justify="left"] {&#xa;  text-align: left;&#xa;}&#xa;&#xa;mjx-container[jax="SVG"][justify="right"] {&#xa;  text-align: right;&#xa;}&#xa;&#xa;g[data-mml-node="merror"] &gt; g {&#xa;  fill: red;&#xa;  stroke: red;&#xa;}&#xa;&#xa;g[data-mml-node="merror"] &gt; rect[data-background] {&#xa;  fill: yellow;&#xa;  stroke: none;&#xa;}&#xa;&#xa;g[data-mml-node="mtable"] &gt; line[data-line], svg[data-table] &gt; g &gt; line[data-line] {&#xa;  stroke-width: 70px;&#xa;  fill: none;&#xa;}&#xa;&#xa;g[data-mml-node="mtable"] &gt; rect[data-frame], svg[data-table] &gt; g &gt; rect[data-frame] {&#xa;  stroke-width: 70px;&#xa;  fill: none;&#xa;}&#xa;&#xa;g[data-mml-node="mtable"] &gt; .mjx-dashed, svg[data-table] &gt; g &gt; .mjx-dashed {&#xa;  stroke-dasharray: 140;&#xa;}&#xa;&#xa;g[data-mml-node="mtable"] &gt; .mjx-dotted, svg[data-table] &gt; g &gt; .mjx-dotted {&#xa;  stroke-linecap: round;&#xa;  stroke-dasharray: 0,140;&#xa;}&#xa;&#xa;g[data-mml-node="mtable"] &gt; g &gt; svg {&#xa;  overflow: visible;&#xa;}&#xa;&#xa;[jax="SVG"] mjx-tool {&#xa;  display: inline-block;&#xa;  position: relative;&#xa;  width: 0;&#xa;  height: 0;&#xa;}&#xa;&#xa;[jax="SVG"] mjx-tool &gt; mjx-tip {&#xa;  position: absolute;&#xa;  top: 0;&#xa;  left: 0;&#xa;}&#xa;&#xa;mjx-tool &gt; mjx-tip {&#xa;  display: inline-block;&#xa;  padding: .2em;&#xa;  border: 1px solid #888;&#xa;  font-size: 70%;&#xa;  background-color: #F8F8F8;&#xa;  color: black;&#xa;  box-shadow: 2px 2px 5px #AAAAAA;&#xa;}&#xa;&#xa;g[data-mml-node="maction"][data-toggle] {&#xa;  cursor: pointer;&#xa;}&#xa;&#xa;mjx-status {&#xa;  display: block;&#xa;  position: fixed;&#xa;  left: 1em;&#xa;  bottom: 1em;&#xa;  min-width: 25%;&#xa;  padding: .2em .4em;&#xa;  border: 1px solid #888;&#xa;  font-size: 90%;&#xa;  background-color: #F8F8F8;&#xa;  color: black;&#xa;}&#xa;&#xa;foreignObject[data-mjx-xml] {&#xa;  font-family: initial;&#xa;  line-height: normal;&#xa;  overflow: visible;&#xa;}&#xa;&#xa;mjx-container[jax="SVG"] path[data-c], mjx-container[jax="SVG"] use[data-c] {&#xa;  stroke-width: 3;&#xa;}&#xa;
          </style>
        </defs>
        <rect fill="#ffffff" width="100%" height="100%" x="0" y="0" />
        <g>
          <g data-cell-id="0">
            <g data-cell-id="1">
              <g data-cell-id="JjTASg2ex2UWmYMPivOh-3">
                <g
                  id="cell-JjTASg2ex2UWmYMPivOh-3"
                  content='&lt;object label="" cpuName="WBMUX" cpuComponent="WBMUX"/&gt;'
                  data-label=""
                  data-cpuName="WBMUX"
                  data-cpuComponent="WBMUX"
                >
                  <g
                    id="cell-JjTASg2ex2UWmYMPivOh-3"
                    content='&lt;object label="" cpuName="WBMUX" cpuComponent="WBMUX"/&gt;'
                    data-label=""
                    data-cpuName="WBMUX"
                    data-cpuComponent="WBMUX"
                  >
                    <g
                      style="filter: drop-shadow(rgba(0, 0, 0, 0.25) 2px 3px 2px);"
                    >
                      <rect
                        x="970.17"
                        y="303.38"
                        width="50"
                        height="70"
                        rx="17.5"
                        ry="17.5"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        transform="rotate(180,995.17,338.38)"
                        pointer-events="all"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="HZNe9g323tp8alZJZz6p-50">
                <g
                  id="cell-HZNe9g323tp8alZJZz6p-50"
                  content='&lt;object label="" cpuName="BUMUX" cpuComponent="BUMUX"/&gt;'
                  data-label=""
                  data-cpuName="BUMUX"
                  data-cpuComponent="BUMUX"
                >
                  <g
                    id="cell-HZNe9g323tp8alZJZz6p-50"
                    content='&lt;object label="" cpuName="BUMUX" cpuComponent="BUMUX"/&gt;'
                    data-label=""
                    data-cpuName="BUMUX"
                    data-cpuComponent="BUMUX"
                  >
                    <g
                      style="filter: drop-shadow(rgba(0, 0, 0, 0.25) 2px 3px 2px);"
                    >
                      <rect
                        x="927"
                        y="38"
                        width="40"
                        height="61"
                        rx="14"
                        ry="14"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        transform="rotate(180,947,68.5)"
                        pointer-events="all"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="F9JKnwVoIiv49AdzHxnh-37">
                <g
                  id="cell-F9JKnwVoIiv49AdzHxnh-37"
                  content='&lt;object label="" cpuName="ALUA" cpuComponent="ALUA"/&gt;'
                  data-label=""
                  data-cpuName="ALUA"
                  data-cpuComponent="ALUA"
                >
                  <g
                    id="cell-F9JKnwVoIiv49AdzHxnh-37"
                    content='&lt;object label="" cpuName="ALUA" cpuComponent="ALUA"/&gt;'
                    data-label=""
                    data-cpuName="ALUA"
                    data-cpuComponent="ALUA"
                  >
                    <g
                      style="filter: drop-shadow(rgba(0, 0, 0, 0.25) 2px 3px 2px);"
                    >
                      <rect
                        x="580"
                        y="208"
                        width="45"
                        height="61"
                        rx="15.75"
                        ry="15.75"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        transform="rotate(180,602.5,238.5)"
                        pointer-events="all"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="3aQpnHwIqpuSFoxgzG9x-16">
                <g
                  id="cell-3aQpnHwIqpuSFoxgzG9x-16"
                  content='&lt;object label="0" cpuName="ALUAMUXIC0" cpuPath="ALUAMUXIC0"/&gt;'
                  data-label="0"
                  data-cpuName="ALUAMUXIC0"
                  data-cpuPath="ALUAMUXIC0"
                >
                  <g
                    id="cell-3aQpnHwIqpuSFoxgzG9x-16"
                    content='&lt;object label="0" cpuName="ALUAMUXIC0" cpuPath="ALUAMUXIC0"/&gt;'
                    data-label="0"
                    data-cpuName="ALUAMUXIC0"
                    data-cpuPath="ALUAMUXIC0"
                  >
                    <g>
                      <path
                        d="M 580 257.8 Q 600 258 625 238.5"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="12px"
                      >
                        <text x="614.45" y="258.45">0</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="3aQpnHwIqpuSFoxgzG9x-17">
                <g
                  id="cell-3aQpnHwIqpuSFoxgzG9x-17"
                  content='&lt;object label="1" cpuName="ALUAMUXIC1" cpuPath="ALUAMUXIC1"/&gt;'
                  data-label="1"
                  data-cpuName="ALUAMUXIC1"
                  data-cpuPath="ALUAMUXIC1"
                >
                  <g
                    id="cell-3aQpnHwIqpuSFoxgzG9x-17"
                    content='&lt;object label="1" cpuName="ALUAMUXIC1" cpuPath="ALUAMUXIC1"/&gt;'
                    data-label="1"
                    data-cpuName="ALUAMUXIC1"
                    data-cpuPath="ALUAMUXIC1"
                  >
                    <g>
                      <path
                        d="M 580 217.98 Q 600 218 625 238.5"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="12px"
                      >
                        <text x="614.74" y="224.65">1</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="HZNe9g323tp8alZJZz6p-46">
                <g
                  id="cell-HZNe9g323tp8alZJZz6p-46"
                  content='&lt;object label="" cpuName="ALUB" cpuComponent="ALUB"/&gt;'
                  data-label=""
                  data-cpuName="ALUB"
                  data-cpuComponent="ALUB"
                >
                  <g
                    id="cell-HZNe9g323tp8alZJZz6p-46"
                    content='&lt;object label="" cpuName="ALUB" cpuComponent="ALUB"/&gt;'
                    data-label=""
                    data-cpuName="ALUB"
                    data-cpuComponent="ALUB"
                  >
                    <g
                      style="filter: drop-shadow(rgba(0, 0, 0, 0.25) 2px 3px 2px);"
                    >
                      <rect
                        x="579.5"
                        y="324"
                        width="45"
                        height="61"
                        rx="15.75"
                        ry="15.75"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        transform="rotate(180,602,354.5)"
                        pointer-events="all"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="F9JKnwVoIiv49AdzHxnh-13">
                <g
                  id="cell-F9JKnwVoIiv49AdzHxnh-13"
                  content='&lt;object label="Registers&amp;#10;Unit" cpuName="RU" cpuComponent="RU"/&gt;'
                  data-label="Registers&#10;Unit"
                  data-cpuName="RU"
                  data-cpuComponent="RU"
                >
                  <g
                    id="cell-F9JKnwVoIiv49AdzHxnh-13"
                    content='&lt;object label="Registers&amp;#10;Unit" cpuName="RU" cpuComponent="RU"/&gt;'
                    data-label="Registers&#10;Unit"
                    data-cpuName="RU"
                    data-cpuComponent="RU"
                  >
                    <g
                      style="filter: drop-shadow(rgba(0, 0, 0, 0.25) 2px 3px 2px);"
                    >
                      <rect
                        x="400"
                        y="198"
                        width="110"
                        height="190"
                        rx="16.5"
                        ry="16.5"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        text-anchor="middle"
                        font-size="16px"
                      >
                        <text x="454.5" y="290">Registers</text>
                        <text x="454.5" y="309">Unit</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="3aQpnHwIqpuSFoxgzG9x-22">
                <g
                  id="cell-3aQpnHwIqpuSFoxgzG9x-22"
                  content='&lt;object label="0" cpuName="ALUBMUXIC0" cpuPath="ALUBMUXIC0"/&gt;'
                  data-label="0"
                  data-cpuName="ALUBMUXIC0"
                  data-cpuPath="ALUBMUXIC0"
                >
                  <g
                    id="cell-3aQpnHwIqpuSFoxgzG9x-22"
                    content='&lt;object label="0" cpuName="ALUBMUXIC0" cpuPath="ALUBMUXIC0"/&gt;'
                    data-label="0"
                    data-cpuName="ALUBMUXIC0"
                    data-cpuPath="ALUBMUXIC0"
                  >
                    <g>
                      <path
                        d="M 579.5 333.98 Q 610 338 624.5 354.5"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="12px"
                      >
                        <text x="611.57" y="338.93">0</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="3aQpnHwIqpuSFoxgzG9x-23">
                <g
                  id="cell-3aQpnHwIqpuSFoxgzG9x-23"
                  content='&lt;object label="1" cpuName="ALUBMUXIC1" cpuPath="ALUBMUXIC1"/&gt;'
                  data-label="1"
                  data-cpuName="ALUBMUXIC1"
                  data-cpuPath="ALUBMUXIC1"
                >
                  <g
                    id="cell-3aQpnHwIqpuSFoxgzG9x-23"
                    content='&lt;object label="1" cpuName="ALUBMUXIC1" cpuPath="ALUBMUXIC1"/&gt;'
                    data-label="1"
                    data-cpuName="ALUBMUXIC1"
                    data-cpuPath="ALUBMUXIC1"
                  >
                    <g>
                      <path
                        d="M 579.5 373.8 Q 610 368 624.5 354.5"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="12px"
                      >
                        <text x="613.45" y="378.02">1</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="3aQpnHwIqpuSFoxgzG9x-32">
                <g
                  id="cell-3aQpnHwIqpuSFoxgzG9x-32"
                  content='&lt;object label="1" cpuName="BUMUXIC1" cpuPath="BUMUXIC1"/&gt;'
                  data-label="1"
                  data-cpuName="BUMUXIC1"
                  data-cpuPath="BUMUXIC1"
                >
                  <g
                    id="cell-3aQpnHwIqpuSFoxgzG9x-32"
                    content='&lt;object label="1" cpuName="BUMUXIC1" cpuPath="BUMUXIC1"/&gt;'
                    data-label="1"
                    data-cpuName="BUMUXIC1"
                    data-cpuPath="BUMUXIC1"
                  >
                    <g>
                      <path
                        d="M 927 87.8 Q 947 87 967 68.5"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="12px"
                      >
                        <text x="954.66" y="89.4">1</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="3aQpnHwIqpuSFoxgzG9x-31">
                <g
                  id="cell-3aQpnHwIqpuSFoxgzG9x-31"
                  content='&lt;object label="0" cpuName="BUMUXIC0" cpuPath="BUMUXIC0"/&gt;'
                  data-label="0"
                  data-cpuName="BUMUXIC0"
                  data-cpuPath="BUMUXIC0"
                >
                  <g
                    id="cell-3aQpnHwIqpuSFoxgzG9x-31"
                    content='&lt;object label="0" cpuName="BUMUXIC0" cpuPath="BUMUXIC0"/&gt;'
                    data-label="0"
                    data-cpuName="BUMUXIC0"
                    data-cpuPath="BUMUXIC0"
                  >
                    <g>
                      <path
                        d="M 927 47.98 Q 947 47 967 68.5"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="12px"
                      >
                        <text x="954.77" y="51.58">0</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="3aQpnHwIqpuSFoxgzG9x-38">
                <g
                  id="cell-3aQpnHwIqpuSFoxgzG9x-38"
                  content='&lt;object label="00" cpuName="WBMUXIC00" cpuPath="WBMUXIC00"/&gt;'
                  data-label="00"
                  data-cpuName="WBMUXIC00"
                  data-cpuPath="WBMUXIC00"
                >
                  <g
                    id="cell-3aQpnHwIqpuSFoxgzG9x-38"
                    content='&lt;object label="00" cpuName="WBMUXIC00" cpuPath="WBMUXIC00"/&gt;'
                    data-label="00"
                    data-cpuName="WBMUXIC00"
                    data-cpuPath="WBMUXIC00"
                  >
                    <g>
                      <path
                        d="M 970.17 355.88 Q 1000 358 1020.17 338.38"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                    </g>
                    <g>
                      <g
                        fill="#FF0000"
                        font-family='"Roboto Mono"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="12px"
                      >
                        <text x="1000.85" y="367.21">00</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="3aQpnHwIqpuSFoxgzG9x-37">
                <g
                  id="cell-3aQpnHwIqpuSFoxgzG9x-37"
                  content='&lt;object label="01" cpuName="WBMUXIC01" cpuPath="WBMUXIC01"/&gt;'
                  data-label="01"
                  data-cpuName="WBMUXIC01"
                  data-cpuPath="WBMUXIC01"
                >
                  <g
                    id="cell-3aQpnHwIqpuSFoxgzG9x-37"
                    content='&lt;object label="01" cpuName="WBMUXIC01" cpuPath="WBMUXIC01"/&gt;'
                    data-label="01"
                    data-cpuName="WBMUXIC01"
                    data-cpuPath="WBMUXIC01"
                  >
                    <g>
                      <path
                        d="M 970.17 338.38 L 1020.17 338.38"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                    </g>
                    <g>
                      <g
                        fill="#FF0000"
                        font-family='"Roboto Mono"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="11px"
                      >
                        <text x="979.39" y="334.38">01</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="3aQpnHwIqpuSFoxgzG9x-36">
                <g
                  id="cell-3aQpnHwIqpuSFoxgzG9x-36"
                  content='&lt;object label="10" cpuName="WBMUXIC10" cpuPath="WBMUXIC10"/&gt;'
                  data-label="10"
                  data-cpuName="WBMUXIC10"
                  data-cpuPath="WBMUXIC10"
                >
                  <g
                    id="cell-3aQpnHwIqpuSFoxgzG9x-36"
                    content='&lt;object label="10" cpuName="WBMUXIC10" cpuPath="WBMUXIC10"/&gt;'
                    data-label="10"
                    data-cpuName="WBMUXIC10"
                    data-cpuPath="WBMUXIC10"
                  >
                    <g>
                      <path
                        d="M 970.17 320.88 Q 990 318 1020.17 338.38"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                    </g>
                    <g>
                      <g
                        fill="#FF0000"
                        font-family='"Roboto Mono"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="12px"
                      >
                        <text x="1000.41" y="322.63">10</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="3aQpnHwIqpuSFoxgzG9x-19">
                <g id="cell-3aQpnHwIqpuSFoxgzG9x-19">
                  <g id="cell-3aQpnHwIqpuSFoxgzG9x-19">
                    <g />
                  </g>
                </g>
              </g>
              <g data-cell-id="5p_Ua0qcicRBEdsBSy3l-46">
                <g
                  id="cell-5p_Ua0qcicRBEdsBSy3l-46"
                  content='&lt;object label="ALU" cpuName="ALU" cpuComponent="ALU"/&gt;'
                  data-label="ALU"
                  data-cpuName="ALU"
                  data-cpuComponent="ALU"
                >
                  <g
                    id="cell-5p_Ua0qcicRBEdsBSy3l-46"
                    content='&lt;object label="ALU" cpuName="ALU" cpuComponent="ALU"/&gt;'
                    data-label="ALU"
                    data-cpuName="ALU"
                    data-cpuComponent="ALU"
                  >
                    <g
                      style="filter: drop-shadow(rgba(0, 0, 0, 0.25) 2px 3px 2px);"
                    >
                      <path
                        d="M 600.35 336.36 L 620.35 253.63 L 776.6 253.63 L 796.6 336.36 Z"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="4"
                        stroke-miterlimit="10"
                        transform="rotate(90,698.47,295)"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        text-anchor="middle"
                        font-size="16px"
                      >
                        <text x="697.97" y="337.62">ALU</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="F9JKnwVoIiv49AdzHxnh-45">
                <g
                  id="cell-F9JKnwVoIiv49AdzHxnh-45"
                  content='&lt;object label="" cpuName="RUALUA" cpuPath="RUALUA"/&gt;'
                  data-label=""
                  data-cpuName="RUALUA"
                  data-cpuPath="RUALUA"
                >
                  <g
                    id="cell-F9JKnwVoIiv49AdzHxnh-45"
                    content='&lt;object label="" cpuName="RUALUA" cpuPath="RUALUA"/&gt;'
                    data-label=""
                    data-cpuName="RUALUA"
                    data-cpuPath="RUALUA"
                  >
                    <g>
                      <path
                        d="M 510 257.9 L 569.92 257.81"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                      <path
                        d="M 576.67 257.8 L 567.68 262.32 L 569.92 257.81 L 567.67 253.32 Z"
                        fill="rgb(0, 0, 0)"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="all"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="F9JKnwVoIiv49AdzHxnh-14">
                <g
                  id="cell-F9JKnwVoIiv49AdzHxnh-14"
                  content='&lt;object label="RU[rs1]" cpuName="RUTEXTOUTRD1"/&gt;'
                  data-label="RU[rs1]"
                  data-cpuName="RUTEXTOUTRD1"
                >
                  <g
                    id="cell-F9JKnwVoIiv49AdzHxnh-14"
                    content='&lt;object label="RU[rs1]" cpuName="RUTEXTOUTRD1"/&gt;'
                    data-label="RU[rs1]"
                    data-cpuName="RUTEXTOUTRD1"
                  >
                    <g>
                      <rect
                        x="449.88"
                        y="238"
                        width="60"
                        height="20"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        font-style="italic"
                        text-anchor="end"
                        font-size="12px"
                      >
                        <text x="507.38" y="252.5">RU[rs1]</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="F9JKnwVoIiv49AdzHxnh-22">
                <g
                  id="cell-F9JKnwVoIiv49AdzHxnh-22"
                  content='&lt;object label="RU[rs2]" cpuName="RUTEXTOUTRD2"/&gt;'
                  data-label="RU[rs2]"
                  data-cpuName="RUTEXTOUTRD2"
                >
                  <g
                    id="cell-F9JKnwVoIiv49AdzHxnh-22"
                    content='&lt;object label="RU[rs2]" cpuName="RUTEXTOUTRD2"/&gt;'
                    data-label="RU[rs2]"
                    data-cpuName="RUTEXTOUTRD2"
                  >
                    <g>
                      <rect
                        x="448.75"
                        y="318"
                        width="60.25"
                        height="20"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        font-style="italic"
                        text-anchor="end"
                        font-size="12px"
                      >
                        <text x="506.5" y="332.5">RU[rs2]</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="F9JKnwVoIiv49AdzHxnh-25">
                <g
                  id="cell-F9JKnwVoIiv49AdzHxnh-25"
                  content='&lt;object label="Inst[19:15] rs1" cpuName="IMRURS1" cpuPath="IMRURS1"/&gt;'
                  data-label="Inst[19:15] rs1"
                  data-cpuName="IMRURS1"
                  data-cpuPath="IMRURS1"
                >
                  <g
                    id="cell-F9JKnwVoIiv49AdzHxnh-25"
                    content='&lt;object label="Inst[19:15] rs1" cpuName="IMRURS1" cpuPath="IMRURS1"/&gt;'
                    data-label="Inst[19:15] rs1"
                    data-cpuName="IMRURS1"
                    data-cpuPath="IMRURS1"
                  >
                    <g>
                      <path
                        d="M 225 338.2 L 264.03 338.2 L 264.03 222.03 L 330.03 222.03 L 389.9 222.6"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                      <path
                        d="M 396.65 222.67 L 387.6 227.08 L 389.9 222.6 L 387.69 218.08 Z"
                        fill="rgb(0, 0, 0)"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="12px"
                      >
                        <text x="327.76" y="215.53">Inst[19:15] rs1</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="F9JKnwVoIiv49AdzHxnh-26">
                <g
                  id="cell-F9JKnwVoIiv49AdzHxnh-26"
                  content='&lt;object label="Inst[24:20] rs2" cpuName="IMRURS2" cpuPath="IMRURS2"/&gt;'
                  data-label="Inst[24:20] rs2"
                  data-cpuName="IMRURS2"
                  data-cpuPath="IMRURS2"
                >
                  <g
                    id="cell-F9JKnwVoIiv49AdzHxnh-26"
                    content='&lt;object label="Inst[24:20] rs2" cpuName="IMRURS2" cpuPath="IMRURS2"/&gt;'
                    data-label="Inst[24:20] rs2"
                    data-cpuName="IMRURS2"
                    data-cpuPath="IMRURS2"
                  >
                    <g>
                      <path
                        d="M 225 338.2 L 264.03 338.2 L 264.03 257.51 L 389.9 257.47"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                      <path
                        d="M 396.65 257.47 L 387.65 261.97 L 389.9 257.47 L 387.64 252.97 Z"
                        fill="rgb(0, 0, 0)"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="12px"
                      >
                        <text x="335.24" y="248.99">Inst[24:20] rs2</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="F9JKnwVoIiv49AdzHxnh-27">
                <g
                  id="cell-F9JKnwVoIiv49AdzHxnh-27"
                  content='&lt;object label="Inst[11:7] rd" cpuName="IMRURDEST" cpuPath="IMRURDEST"/&gt;'
                  data-label="Inst[11:7] rd"
                  data-cpuName="IMRURDEST"
                  data-cpuPath="IMRURDEST"
                >
                  <g
                    id="cell-F9JKnwVoIiv49AdzHxnh-27"
                    content='&lt;object label="Inst[11:7] rd" cpuName="IMRURDEST" cpuPath="IMRURDEST"/&gt;'
                    data-label="Inst[11:7] rd"
                    data-cpuName="IMRURDEST"
                    data-cpuPath="IMRURDEST"
                  >
                    <g>
                      <path
                        d="M 225 338.2 L 232.03 338.2 L 389.9 338.58"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                      <path
                        d="M 396.65 338.59 L 387.64 343.07 L 389.9 338.58 L 387.66 334.07 Z"
                        fill="rgb(0, 0, 0)"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="12px"
                      >
                        <text x="319.38" y="331.91">Inst[11:7] rd</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="F9JKnwVoIiv49AdzHxnh-32">
                <g
                  id="cell-F9JKnwVoIiv49AdzHxnh-32"
                  content='&lt;object label="Inst[6:0] OpCode" cpuName="IMCUOPCODE" cpuPath="IMCUOPCODE"/&gt;'
                  data-label="Inst[6:0] OpCode"
                  data-cpuName="IMCUOPCODE"
                  data-cpuPath="IMCUOPCODE"
                >
                  <g
                    id="cell-F9JKnwVoIiv49AdzHxnh-32"
                    content='&lt;object label="Inst[6:0] OpCode" cpuName="IMCUOPCODE" cpuPath="IMCUOPCODE"/&gt;'
                    data-label="Inst[6:0] OpCode"
                    data-cpuName="IMCUOPCODE"
                    data-cpuPath="IMCUOPCODE"
                  >
                    <g>
                      <path
                        d="M 225 338.2 L 264.03 338.2 L 264.03 76.03 L 409.9 76"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                      <path
                        d="M 416.65 76 L 407.65 80.5 L 409.9 76 L 407.65 71.5 Z"
                        fill="rgb(0, 0, 0)"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="12px"
                      >
                        <text x="329.75" y="68.52">Inst[6:0] OpCode</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="F9JKnwVoIiv49AdzHxnh-33">
                <g
                  id="cell-F9JKnwVoIiv49AdzHxnh-33"
                  content='&lt;object label="Inst[14:12] Funct3" cpuName="IMCUFUNCT3" cpuPath="IMCUFUNCT3"/&gt;'
                  data-label="Inst[14:12] Funct3"
                  data-cpuName="IMCUFUNCT3"
                  data-cpuPath="IMCUFUNCT3"
                >
                  <g
                    id="cell-F9JKnwVoIiv49AdzHxnh-33"
                    content='&lt;object label="Inst[14:12] Funct3" cpuName="IMCUFUNCT3" cpuPath="IMCUFUNCT3"/&gt;'
                    data-label="Inst[14:12] Funct3"
                    data-cpuName="IMCUFUNCT3"
                    data-cpuPath="IMCUFUNCT3"
                  >
                    <g>
                      <path
                        d="M 225 338.2 L 264.03 338.2 L 264.03 108.03 L 409.9 108"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                      <path
                        d="M 416.65 108 L 407.65 112.5 L 409.9 108 L 407.65 103.5 Z"
                        fill="rgb(0, 0, 0)"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="12px"
                      >
                        <text x="337.76" y="101.51">Inst[14:12] Funct3</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="F9JKnwVoIiv49AdzHxnh-34">
                <g
                  id="cell-F9JKnwVoIiv49AdzHxnh-34"
                  content='&lt;object label="Inst[31:25] Funct7" cpuName="IMCUFUNCT7" cpuPath="IMCUFUNCT7"/&gt;'
                  data-label="Inst[31:25] Funct7"
                  data-cpuName="IMCUFUNCT7"
                  data-cpuPath="IMCUFUNCT7"
                >
                  <g
                    id="cell-F9JKnwVoIiv49AdzHxnh-34"
                    content='&lt;object label="Inst[31:25] Funct7" cpuName="IMCUFUNCT7" cpuPath="IMCUFUNCT7"/&gt;'
                    data-label="Inst[31:25] Funct7"
                    data-cpuName="IMCUFUNCT7"
                    data-cpuPath="IMCUFUNCT7"
                  >
                    <g>
                      <path
                        d="M 225 338.2 L 264.03 338.2 L 264.03 140.03 L 409.9 140"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                      <path
                        d="M 416.65 140 L 407.65 144.5 L 409.9 140 L 407.65 135.5 Z"
                        fill="rgb(0, 0, 0)"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="12px"
                      >
                        <text x="337.76" y="133.51">Inst[31:25] Funct7</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="F9JKnwVoIiv49AdzHxnh-50">
                <g
                  id="cell-F9JKnwVoIiv49AdzHxnh-50"
                  content='&lt;object label="" cpuName="IMMALUB" cpuPath="IMMALUB"/&gt;'
                  data-label=""
                  data-cpuName="IMMALUB"
                  data-cpuPath="IMMALUB"
                >
                  <g
                    id="cell-F9JKnwVoIiv49AdzHxnh-50"
                    content='&lt;object label="" cpuName="IMMALUB" cpuPath="IMMALUB"/&gt;'
                    data-label=""
                    data-cpuName="IMMALUB"
                    data-cpuPath="IMMALUB"
                  >
                    <g>
                      <path
                        d="M 510 493 L 550.03 493 L 550.03 373.8 L 569.4 373.8"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                      <path
                        d="M 576.15 373.8 L 567.15 378.3 L 569.4 373.8 L 567.15 369.3 Z"
                        fill="rgb(0, 0, 0)"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="all"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="F9JKnwVoIiv49AdzHxnh-35">
                <g
                  id="cell-F9JKnwVoIiv49AdzHxnh-35"
                  content='&lt;object label="Immediate&amp;#10;Generator" cpuName="IMM" cpuComponent="IMM"/&gt;'
                  data-label="Immediate&#10;Generator"
                  data-cpuName="IMM"
                  data-cpuComponent="IMM"
                >
                  <g
                    id="cell-F9JKnwVoIiv49AdzHxnh-35"
                    content='&lt;object label="Immediate&amp;#10;Generator" cpuName="IMM" cpuComponent="IMM"/&gt;'
                    data-label="Immediate&#10;Generator"
                    data-cpuName="IMM"
                    data-cpuComponent="IMM"
                  >
                    <g
                      style="filter: drop-shadow(rgba(0, 0, 0, 0.25) 2px 3px 2px);"
                    >
                      <rect
                        x="400"
                        y="468"
                        width="110"
                        height="50"
                        rx="7.5"
                        ry="7.5"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        text-anchor="middle"
                        font-size="16px"
                      >
                        <text x="454.5" y="489.5">Immediate</text>
                        <text x="454.5" y="508.5">Generator</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="F9JKnwVoIiv49AdzHxnh-36">
                <g
                  id="cell-F9JKnwVoIiv49AdzHxnh-36"
                  content='&lt;object label="Inst[31:7]" cpuName="IMIMM" cpuPath="IMIMM"/&gt;'
                  data-label="Inst[31:7]"
                  data-cpuName="IMIMM"
                  data-cpuPath="IMIMM"
                >
                  <g
                    id="cell-F9JKnwVoIiv49AdzHxnh-36"
                    content='&lt;object label="Inst[31:7]" cpuName="IMIMM" cpuPath="IMIMM"/&gt;'
                    data-label="Inst[31:7]"
                    data-cpuName="IMIMM"
                    data-cpuPath="IMIMM"
                  >
                    <g>
                      <path
                        d="M 225 338.2 L 264.03 338.2 L 264.03 481 L 389.92 481"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                      <path
                        d="M 396.67 481 L 387.67 485.5 L 389.92 481 L 387.67 476.5 Z"
                        fill="rgb(0, 0, 0)"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="12px"
                      >
                        <text x="308.56" y="473.5">Inst[31:7]</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="F9JKnwVoIiv49AdzHxnh-52">
                <g
                  id="cell-F9JKnwVoIiv49AdzHxnh-52"
                  content='&lt;object label="" cpuName="PCIM" cpuPath="PCIM"/&gt;'
                  data-label=""
                  data-cpuName="PCIM"
                  data-cpuPath="PCIM"
                >
                  <g
                    id="cell-F9JKnwVoIiv49AdzHxnh-52"
                    content='&lt;object label="" cpuName="PCIM" cpuPath="PCIM"/&gt;'
                    data-label=""
                    data-cpuName="PCIM"
                    data-cpuPath="PCIM"
                  >
                    <g>
                      <path
                        d="M 55 303 L 104.9 303"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                      <path
                        d="M 111.65 303 L 102.65 307.5 L 104.9 303 L 102.65 298.5 Z"
                        fill="rgb(0, 0, 0)"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="all"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="F9JKnwVoIiv49AdzHxnh-53">
                <g
                  id="cell-F9JKnwVoIiv49AdzHxnh-53"
                  content='&lt;object label="" cpuName="PCALUA" cpuPath="PCALUA"/&gt;'
                  data-label=""
                  data-cpuName="PCALUA"
                  data-cpuPath="PCALUA"
                >
                  <g
                    id="cell-F9JKnwVoIiv49AdzHxnh-53"
                    content='&lt;object label="" cpuName="PCALUA" cpuPath="PCALUA"/&gt;'
                    data-label=""
                    data-cpuName="PCALUA"
                    data-cpuPath="PCALUA"
                  >
                    <g>
                      <path
                        d="M 55 303 L 85 303 L 85 178.03 L 259.03 178.03 C 259.03 171.53 269.03 171.53 269.03 178.03 L 269.03 178.03 L 560.03 178.03 L 560.03 218.03 L 569.9 218"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                      <path
                        d="M 576.65 217.99 L 567.66 222.51 L 569.9 218 L 567.64 213.51 Z"
                        fill="rgb(0, 0, 0)"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="all"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="5p_Ua0qcicRBEdsBSy3l-56">
                <g
                  id="cell-5p_Ua0qcicRBEdsBSy3l-56"
                  content='&lt;object label="" cpuName="ALUBUMUX" cpuPath="ALUBUMUX"/&gt;'
                  data-label=""
                  data-cpuName="ALUBUMUX"
                  data-cpuPath="ALUBUMUX"
                >
                  <g
                    id="cell-5p_Ua0qcicRBEdsBSy3l-56"
                    content='&lt;object label="" cpuName="ALUBUMUX" cpuPath="ALUBUMUX"/&gt;'
                    data-label=""
                    data-cpuName="ALUBUMUX"
                    data-cpuPath="ALUBUMUX"
                  >
                    <g>
                      <path
                        d="M 742 298 L 760.03 298.03 L 760.03 87.8 L 916.9 87.8"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                      <path
                        d="M 923.65 87.8 L 914.65 92.3 L 916.9 87.8 L 914.65 83.3 Z"
                        fill="rgb(0, 0, 0)"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="all"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="5p_Ua0qcicRBEdsBSy3l-62">
                <g
                  id="cell-5p_Ua0qcicRBEdsBSy3l-62"
                  content='&lt;object label="" cpuName="ALUWBMUX" cpuPath="ALUWBMUX"/&gt;'
                  data-label=""
                  data-cpuName="ALUWBMUX"
                  data-cpuPath="ALUWBMUX"
                >
                  <g
                    id="cell-5p_Ua0qcicRBEdsBSy3l-62"
                    content='&lt;object label="" cpuName="ALUWBMUX" cpuPath="ALUWBMUX"/&gt;'
                    data-label=""
                    data-cpuName="ALUWBMUX"
                    data-cpuPath="ALUWBMUX"
                  >
                    <g>
                      <path
                        d="M 740.84 297.96 L 760.03 298.03 L 760.03 409 L 950.03 409 L 950.03 355.91 L 960.07 355.9"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                      <path
                        d="M 966.82 355.89 L 957.83 360.4 L 960.07 355.9 L 957.81 351.4 Z"
                        fill="rgb(0, 0, 0)"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="all"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="F9JKnwVoIiv49AdzHxnh-60">
                <g
                  id="cell-F9JKnwVoIiv49AdzHxnh-60"
                  content='&lt;object label="ALURes" cpuName="ALUTEXTRES"/&gt;'
                  data-label="ALURes"
                  data-cpuName="ALUTEXTRES"
                >
                  <g
                    id="cell-F9JKnwVoIiv49AdzHxnh-60"
                    content='&lt;object label="ALURes" cpuName="ALUTEXTRES"/&gt;'
                    data-label="ALURes"
                    data-cpuName="ALUTEXTRES"
                  >
                    <g>
                      <rect
                        x="685"
                        y="291.5"
                        width="50.5"
                        height="15"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        font-style="italic"
                        text-anchor="middle"
                        font-size="14px"
                      >
                        <text x="709.75" y="304.5">ALURes</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="F9JKnwVoIiv49AdzHxnh-66">
                <g
                  id="cell-F9JKnwVoIiv49AdzHxnh-66"
                  content='&lt;object label="A" cpuName="ALUTEXTINA"/&gt;'
                  data-label="A"
                  data-cpuName="ALUTEXTINA"
                >
                  <g
                    id="cell-F9JKnwVoIiv49AdzHxnh-66"
                    content='&lt;object label="A" cpuName="ALUTEXTINA"/&gt;'
                    data-label="A"
                    data-cpuName="ALUTEXTINA"
                  >
                    <g>
                      <rect
                        x="660"
                        y="228"
                        width="10"
                        height="10"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        font-style="italic"
                        text-anchor="middle"
                        font-size="12px"
                      >
                        <text x="664.5" y="237.5">A</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="F9JKnwVoIiv49AdzHxnh-67">
                <g
                  id="cell-F9JKnwVoIiv49AdzHxnh-67"
                  content='&lt;object label="B" cpuName="ALUTEXTINB"/&gt;'
                  data-label="B"
                  data-cpuName="ALUTEXTINB"
                >
                  <g
                    id="cell-F9JKnwVoIiv49AdzHxnh-67"
                    content='&lt;object label="B" cpuName="ALUTEXTINB"/&gt;'
                    data-label="B"
                    data-cpuName="ALUTEXTINB"
                  >
                    <g>
                      <rect
                        x="660"
                        y="348"
                        width="10"
                        height="10"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        font-style="italic"
                        text-anchor="middle"
                        font-size="12px"
                      >
                        <text x="664.5" y="357.5">B</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="R1t3jsTBfXNnKp8FjOYN-12">
                <g
                  id="cell-R1t3jsTBfXNnKp8FjOYN-12"
                  content='&lt;object label="NextPCSrc" cpuName="BUBUMUX" cpuPath="BUBUMUX"/&gt;'
                  data-label="NextPCSrc"
                  data-cpuName="BUBUMUX"
                  data-cpuPath="BUBUMUX"
                >
                  <g
                    id="cell-R1t3jsTBfXNnKp8FjOYN-12"
                    content='&lt;object label="NextPCSrc" cpuName="BUBUMUX" cpuPath="BUBUMUX"/&gt;'
                    data-label="NextPCSrc"
                    data-cpuName="BUBUMUX"
                    data-cpuPath="BUBUMUX"
                  >
                    <g>
                      <path
                        d="M 741 138.03 L 755.03 138.03 C 755.03 131.53 765.03 131.53 765.03 138.03 L 765.03 138.03 L 947 138.03 L 947 109.1"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                      <path
                        d="M 947 102.35 L 951.5 111.35 L 947 109.1 L 942.5 111.35 Z"
                        fill="rgb(0, 0, 0)"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="#FF0000"
                        font-family='"Roboto Mono"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="12px"
                      >
                        <text x="911.93" y="152.53">NextPCSrc</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="F9JKnwVoIiv49AdzHxnh-69">
                <g
                  id="cell-F9JKnwVoIiv49AdzHxnh-69"
                  content='&lt;object label="Branch&amp;#10;Unit" cpuName="BU" cpuComponent="BU"/&gt;'
                  data-label="Branch&#10;Unit"
                  data-cpuName="BU"
                  data-cpuComponent="BU"
                >
                  <g
                    id="cell-F9JKnwVoIiv49AdzHxnh-69"
                    content='&lt;object label="Branch&amp;#10;Unit" cpuName="BU" cpuComponent="BU"/&gt;'
                    data-label="Branch&#10;Unit"
                    data-cpuName="BU"
                    data-cpuComponent="BU"
                  >
                    <g
                      style="filter: drop-shadow(rgba(0, 0, 0, 0.25) 2px 3px 2px);"
                    >
                      <rect
                        x="635"
                        y="88"
                        width="106"
                        height="60"
                        rx="9"
                        ry="9"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        text-anchor="middle"
                        font-size="16px"
                      >
                        <text x="687.5" y="115">Branch</text>
                        <text x="687.5" y="134">Unit</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="2nkxqfEYvfUEMSFPvkOz-37">
                <g
                  id="cell-2nkxqfEYvfUEMSFPvkOz-37"
                  content='&lt;object label="" cpuName="ADD4BUMUX" cpuPath="ADD4BUMUX"/&gt;'
                  data-label=""
                  data-cpuName="ADD4BUMUX"
                  data-cpuPath="ADD4BUMUX"
                >
                  <g
                    id="cell-2nkxqfEYvfUEMSFPvkOz-37"
                    content='&lt;object label="" cpuName="ADD4BUMUX" cpuPath="ADD4BUMUX"/&gt;'
                    data-label=""
                    data-cpuName="ADD4BUMUX"
                    data-cpuPath="ADD4BUMUX"
                  >
                    <g>
                      <path
                        d="M 225 49 L 780.03 49 L 916.9 48.05"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                      <path
                        d="M 923.65 48 L 914.68 52.57 L 916.9 48.05 L 914.62 43.57 Z"
                        fill="rgb(0, 0, 0)"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="all"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="R1t3jsTBfXNnKp8FjOYN-5">
                <g
                  id="cell-R1t3jsTBfXNnKp8FjOYN-5"
                  content='&lt;object label="Σ" cpuName="ADD4" cpuComponent="ADD4"/&gt;'
                  data-label="Σ"
                  data-cpuName="ADD4"
                  data-cpuComponent="ADD4"
                >
                  <g
                    id="cell-R1t3jsTBfXNnKp8FjOYN-5"
                    content='&lt;object label="Σ" cpuName="ADD4" cpuComponent="ADD4"/&gt;'
                    data-label="Σ"
                    data-cpuName="ADD4"
                    data-cpuComponent="ADD4"
                  >
                    <g
                      style="filter: drop-shadow(rgba(0, 0, 0, 0.25) 2px 3px 2px);"
                    >
                      <rect
                        x="175"
                        y="22"
                        width="50"
                        height="58"
                        rx="7.5"
                        ry="7.5"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Helvetica"'
                        text-anchor="middle"
                        font-size="27px"
                      >
                        <text x="199.5" y="63">Σ</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="2nkxqfEYvfUEMSFPvkOz-17">
                <g
                  id="cell-2nkxqfEYvfUEMSFPvkOz-17"
                  content='&lt;object label="" cpuName="DMWBMUX" cpuPath="DMWBMUX"/&gt;'
                  data-label=""
                  data-cpuName="DMWBMUX"
                  data-cpuPath="DMWBMUX"
                >
                  <g
                    id="cell-2nkxqfEYvfUEMSFPvkOz-17"
                    content='&lt;object label="" cpuName="DMWBMUX" cpuPath="DMWBMUX"/&gt;'
                    data-label=""
                    data-cpuName="DMWBMUX"
                    data-cpuPath="DMWBMUX"
                  >
                    <g>
                      <path
                        d="M 920 338 L 947 338.03 L 960.07 338.23"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                      <path
                        d="M 966.82 338.33 L 957.75 342.69 L 960.07 338.23 L 957.89 333.69 Z"
                        fill="rgb(0, 0, 0)"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="all"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="R1t3jsTBfXNnKp8FjOYN-13">
                <g
                  id="cell-R1t3jsTBfXNnKp8FjOYN-13"
                  content='&lt;object label="Data&amp;#10;Memory" cpuName="DM" cpuComponent="DM"/&gt;'
                  data-label="Data&#10;Memory"
                  data-cpuName="DM"
                  data-cpuComponent="DM"
                >
                  <g
                    id="cell-R1t3jsTBfXNnKp8FjOYN-13"
                    content='&lt;object label="Data&amp;#10;Memory" cpuName="DM" cpuComponent="DM"/&gt;'
                    data-label="Data&#10;Memory"
                    data-cpuName="DM"
                    data-cpuComponent="DM"
                  >
                    <g
                      style="filter: drop-shadow(rgba(0, 0, 0, 0.25) 2px 3px 2px);"
                    >
                      <rect
                        x="800"
                        y="218"
                        width="120"
                        height="160"
                        rx="18"
                        ry="18"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        text-anchor="middle"
                        font-size="16px"
                      >
                        <text x="859.5" y="239.5">Data</text>
                        <text x="859.5" y="258.5">Memory</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="2nkxqfEYvfUEMSFPvkOz-8">
                <g
                  id="cell-2nkxqfEYvfUEMSFPvkOz-8"
                  content='&lt;object label="DataRd" cpuName="DMTEXTDATARD"/&gt;'
                  data-label="DataRd"
                  data-cpuName="DMTEXTDATARD"
                >
                  <g
                    id="cell-2nkxqfEYvfUEMSFPvkOz-8"
                    content='&lt;object label="DataRd" cpuName="DMTEXTDATARD"/&gt;'
                    data-label="DataRd"
                    data-cpuName="DMTEXTDATARD"
                  >
                    <g>
                      <rect
                        x="875"
                        y="328"
                        width="40"
                        height="20"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Helvetica"'
                        font-style="italic"
                        text-anchor="end"
                        font-size="12px"
                      >
                        <text x="912.5" y="342.5">DataRd</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="2nkxqfEYvfUEMSFPvkOz-24">
                <g
                  id="cell-2nkxqfEYvfUEMSFPvkOz-24"
                  content='&lt;object label="" cpuName="WBMUXRU" cpuPath="WBMUXRU"/&gt;'
                  data-label=""
                  data-cpuName="WBMUXRU"
                  data-cpuPath="WBMUXRU"
                >
                  <g
                    id="cell-2nkxqfEYvfUEMSFPvkOz-24"
                    content='&lt;object label="" cpuName="WBMUXRU" cpuPath="WBMUXRU"/&gt;'
                    data-label=""
                    data-cpuName="WBMUXRU"
                    data-cpuPath="WBMUXRU"
                  >
                    <g>
                      <path
                        d="M 1020.17 338.38 L 1040.03 338.43 L 1040.03 458.03 L 555.03 458.03 C 555.03 451.53 545.03 451.53 545.03 458.03 L 545.03 458.03 L 320.03 458.03 L 320.03 361.4 L 391 361.4"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                      <path
                        d="M 397.75 361.4 L 388.75 365.9 L 391 361.4 L 388.75 356.9 Z"
                        fill="rgb(0, 0, 0)"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="all"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="2nkxqfEYvfUEMSFPvkOz-36">
                <g
                  id="cell-2nkxqfEYvfUEMSFPvkOz-36"
                  content='&lt;object label="" cpuName="PCADD4" cpuPath="PCADD4"/&gt;'
                  data-label=""
                  data-cpuName="PCADD4"
                  data-cpuPath="PCADD4"
                >
                  <g
                    id="cell-2nkxqfEYvfUEMSFPvkOz-36"
                    content='&lt;object label="" cpuName="PCADD4" cpuPath="PCADD4"/&gt;'
                    data-label=""
                    data-cpuName="PCADD4"
                    data-cpuPath="PCADD4"
                  >
                    <g>
                      <path
                        d="M 55 303 L 85 303 L 85 68.03 L 164.9 68.03"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                      <path
                        d="M 171.65 68.03 L 162.65 72.53 L 164.9 68.03 L 162.65 63.53 Z"
                        fill="rgb(0, 0, 0)"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="all"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="F9JKnwVoIiv49AdzHxnh-15">
                <g
                  id="cell-F9JKnwVoIiv49AdzHxnh-15"
                  content='&lt;object label="rs1" cpuName="RUTEXTINRS1"/&gt;'
                  data-label="rs1"
                  data-cpuName="RUTEXTINRS1"
                >
                  <g
                    id="cell-F9JKnwVoIiv49AdzHxnh-15"
                    content='&lt;object label="rs1" cpuName="RUTEXTINRS1"/&gt;'
                    data-label="rs1"
                    data-cpuName="RUTEXTINRS1"
                  >
                    <g>
                      <rect
                        x="400"
                        y="208"
                        width="40"
                        height="20"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        font-style="italic"
                        font-size="12px"
                      >
                        <text x="401.5" y="222.5">rs1</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="5p_Ua0qcicRBEdsBSy3l-49">
                <g
                  id="cell-5p_Ua0qcicRBEdsBSy3l-49"
                  content='&lt;object label="" cpuName="ALUDM" cpuPath="ALUDM"/&gt;'
                  data-label=""
                  data-cpuName="ALUDM"
                  data-cpuPath="ALUDM"
                >
                  <g
                    id="cell-5p_Ua0qcicRBEdsBSy3l-49"
                    content='&lt;object label="" cpuName="ALUDM" cpuPath="ALUDM"/&gt;'
                    data-label=""
                    data-cpuName="ALUDM"
                    data-cpuPath="ALUDM"
                  >
                    <g>
                      <path
                        d="M 742 298 L 756.03 298.03 L 789.9 298.01"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                      <path
                        d="M 796.65 298 L 787.65 302.51 L 789.9 298.01 L 787.64 293.51 Z"
                        fill="rgb(0, 0, 0)"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="all"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="5p_Ua0qcicRBEdsBSy3l-50">
                <g
                  id="cell-5p_Ua0qcicRBEdsBSy3l-50"
                  content='&lt;object label="" cpuName="ALUBALU" cpuPath="ALUBALU"/&gt;'
                  data-label=""
                  data-cpuName="ALUBALU"
                  data-cpuPath="ALUBALU"
                >
                  <g
                    id="cell-5p_Ua0qcicRBEdsBSy3l-50"
                    content='&lt;object label="" cpuName="ALUBALU" cpuPath="ALUBALU"/&gt;'
                    data-label=""
                    data-cpuName="ALUBALU"
                    data-cpuPath="ALUBALU"
                  >
                    <g>
                      <path
                        d="M 624.5 354.5 L 630.03 354.49 L 647.01 354.55"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                      <path
                        d="M 653.76 354.58 L 644.74 359.05 L 647.01 354.55 L 644.77 350.05 Z"
                        fill="rgb(0, 0, 0)"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="all"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="5p_Ua0qcicRBEdsBSy3l-51">
                <g
                  id="cell-5p_Ua0qcicRBEdsBSy3l-51"
                  content='&lt;object label="" cpuName="ALUAALU" cpuPath="ALUAALU"/&gt;'
                  data-label=""
                  data-cpuName="ALUAALU"
                  data-cpuPath="ALUAALU"
                >
                  <g
                    id="cell-5p_Ua0qcicRBEdsBSy3l-51"
                    content='&lt;object label="" cpuName="ALUAALU" cpuPath="ALUAALU"/&gt;'
                    data-label=""
                    data-cpuName="ALUAALU"
                    data-cpuPath="ALUAALU"
                  >
                    <g>
                      <path
                        d="M 625 238.5 L 646.72 238.49"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                      <path
                        d="M 653.47 238.49 L 644.48 242.99 L 646.72 238.49 L 644.47 233.99 Z"
                        fill="rgb(0, 0, 0)"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="all"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="5p_Ua0qcicRBEdsBSy3l-65">
                <g
                  id="cell-5p_Ua0qcicRBEdsBSy3l-65"
                  content='&lt;object label="" cpuName="BUMUXPC" cpuPath="BUMUXPC"/&gt;'
                  data-label=""
                  data-cpuName="BUMUXPC"
                  data-cpuPath="BUMUXPC"
                >
                  <g
                    id="cell-5p_Ua0qcicRBEdsBSy3l-65"
                    content='&lt;object label="" cpuName="BUMUXPC" cpuPath="BUMUXPC"/&gt;'
                    data-label=""
                    data-cpuName="BUMUXPC"
                    data-cpuPath="BUMUXPC"
                  >
                    <g>
                      <path
                        d="M 967 68.5 L 1001 68.49 L 1001 8.03 L 30.03 8.03 L 30 257.9"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                      <path
                        d="M 30 264.65 L 25.5 255.65 L 30 257.9 L 34.5 255.65 Z"
                        fill="rgb(0, 0, 0)"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="all"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="5p_Ua0qcicRBEdsBSy3l-66">
                <g
                  id="cell-5p_Ua0qcicRBEdsBSy3l-66"
                  content='&lt;object label="rs2" cpuName="RUTEXTINRS2"/&gt;'
                  data-label="rs2"
                  data-cpuName="RUTEXTINRS2"
                >
                  <g
                    id="cell-5p_Ua0qcicRBEdsBSy3l-66"
                    content='&lt;object label="rs2" cpuName="RUTEXTINRS2"/&gt;'
                    data-label="rs2"
                    data-cpuName="RUTEXTINRS2"
                  >
                    <g>
                      <rect
                        x="400"
                        y="249"
                        width="30"
                        height="10"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        font-style="italic"
                        font-size="12px"
                      >
                        <text x="401.5" y="258.5">rs2</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="5p_Ua0qcicRBEdsBSy3l-67">
                <g
                  id="cell-5p_Ua0qcicRBEdsBSy3l-67"
                  content='&lt;object label="rd" cpuName="RUTEXTINRD"/&gt;'
                  data-label="rd"
                  data-cpuName="RUTEXTINRD"
                >
                  <g
                    id="cell-5p_Ua0qcicRBEdsBSy3l-67"
                    content='&lt;object label="rd" cpuName="RUTEXTINRD"/&gt;'
                    data-label="rd"
                    data-cpuName="RUTEXTINRD"
                  >
                    <g>
                      <rect
                        x="400"
                        y="334"
                        width="26"
                        height="7.5"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        font-style="italic"
                        font-size="12px"
                      >
                        <text x="401.5" y="342.25">rd</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="5p_Ua0qcicRBEdsBSy3l-68">
                <g
                  id="cell-5p_Ua0qcicRBEdsBSy3l-68"
                  content='&lt;object label="DataWr" cpuName="RUTEXTINDATAWR"/&gt;'
                  data-label="DataWr"
                  data-cpuName="RUTEXTINDATAWR"
                >
                  <g
                    id="cell-5p_Ua0qcicRBEdsBSy3l-68"
                    content='&lt;object label="DataWr" cpuName="RUTEXTINDATAWR"/&gt;'
                    data-label="DataWr"
                    data-cpuName="RUTEXTINDATAWR"
                  >
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        font-style="italic"
                        font-size="12px"
                      >
                        <text x="401.5" y="358.5">DataWr</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="F9JKnwVoIiv49AdzHxnh-2">
                <g
                  id="cell-F9JKnwVoIiv49AdzHxnh-2"
                  content='&lt;object label="PC" cpuName="PC" cpuComponent="PC"/&gt;'
                  data-label="PC"
                  data-cpuName="PC"
                  data-cpuComponent="PC"
                >
                  <g
                    id="cell-F9JKnwVoIiv49AdzHxnh-2"
                    content='&lt;object label="PC" cpuName="PC" cpuComponent="PC"/&gt;'
                    data-label="PC"
                    data-cpuName="PC"
                    data-cpuComponent="PC"
                  >
                    <g
                      style="filter: drop-shadow(rgba(0, 0, 0, 0.25) 2px 3px 2px);"
                    >
                      <rect
                        x="5"
                        y="268"
                        width="50"
                        height="70"
                        rx="7.5"
                        ry="7.5"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-opacity="0.9"
                        stroke-width="3"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        text-anchor="middle"
                        font-size="16px"
                      >
                        <text x="29.5" y="309.5">PC</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="F9JKnwVoIiv49AdzHxnh-3">
                <g
                  id="cell-F9JKnwVoIiv49AdzHxnh-3"
                  content='&lt;object label="" cpuName="PCCLOCK" cpuComponent="PCCLOCK"/&gt;'
                  data-label=""
                  data-cpuName="PCCLOCK"
                  data-cpuComponent="PCCLOCK"
                >
                  <g
                    id="cell-F9JKnwVoIiv49AdzHxnh-3"
                    content='&lt;object label="" cpuName="PCCLOCK" cpuComponent="PCCLOCK"/&gt;'
                    data-label=""
                    data-cpuName="PCCLOCK"
                    data-cpuComponent="PCCLOCK"
                  >
                    <g>
                      <path
                        d="M 25 328 L 35 333 L 25 338 Z"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-miterlimit="10"
                        transform="rotate(-90,30,333)"
                        pointer-events="all"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="3aQpnHwIqpuSFoxgzG9x-9">
                <g id="cell-3aQpnHwIqpuSFoxgzG9x-9">
                  <g id="cell-3aQpnHwIqpuSFoxgzG9x-9">
                    <g />
                  </g>
                </g>
              </g>
              <g data-cell-id="5p_Ua0qcicRBEdsBSy3l-61">
                <g
                  id="cell-5p_Ua0qcicRBEdsBSy3l-61"
                  content='&lt;object label="" cpuName="ADD4WBMUX" cpuPath="ADD4WBMUX"/&gt;'
                  data-label=""
                  data-cpuName="ADD4WBMUX"
                  data-cpuPath="ADD4WBMUX"
                >
                  <g
                    id="cell-5p_Ua0qcicRBEdsBSy3l-61"
                    content='&lt;object label="" cpuName="ADD4WBMUX" cpuPath="ADD4WBMUX"/&gt;'
                    data-label=""
                    data-cpuName="ADD4WBMUX"
                    data-cpuPath="ADD4WBMUX"
                  >
                    <g>
                      <path
                        d="M 225 49 L 780.03 49 L 780.03 82.8 C 786.53 82.8 786.53 92.8 780.03 92.8 L 780.03 92.8 L 780.03 133.03 C 786.53 133.03 786.53 143.03 780.03 143.03 L 780.03 143.03 L 780.03 168.03 L 950.03 168.03 L 950.03 320.89 L 960.07 320.88"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                      <path
                        d="M 966.82 320.88 L 957.82 325.38 L 960.07 320.88 L 957.82 316.38 Z"
                        fill="rgb(0, 0, 0)"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="all"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="F9JKnwVoIiv49AdzHxnh-29">
                <g
                  id="cell-F9JKnwVoIiv49AdzHxnh-29"
                  content='&lt;object label="" cpuName="CUArrow" cpuComponent="CUArrow"/&gt;'
                  data-label=""
                  data-cpuName="CUArrow"
                  data-cpuComponent="CUArrow"
                >
                  <g
                    id="cell-F9JKnwVoIiv49AdzHxnh-29"
                    content='&lt;object label="" cpuName="CUArrow" cpuComponent="CUArrow"/&gt;'
                    data-label=""
                    data-cpuName="CUArrow"
                    data-cpuComponent="CUArrow"
                  >
                    <g>
                      <path
                        d="M 500.24 98.86 L 500.16 76.86 L 516.76 76.8 L 516.71 65.3 L 537.8 87.72 L 516.89 110.3 L 516.84 98.8 Z"
                        fill="none"
                        stroke="#ff0000"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="all"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="F9JKnwVoIiv49AdzHxnh-28">
                <g
                  id="cell-F9JKnwVoIiv49AdzHxnh-28"
                  content='&lt;object label="Control&amp;#10;Unit" cpuName="CU" cpuComponent="CU"/&gt;'
                  data-label="Control&#10;Unit"
                  data-cpuName="CU"
                  data-cpuComponent="CU"
                >
                  <g
                    id="cell-F9JKnwVoIiv49AdzHxnh-28"
                    content='&lt;object label="Control&amp;#10;Unit" cpuName="CU" cpuComponent="CU"/&gt;'
                    data-label="Control&#10;Unit"
                    data-cpuName="CU"
                    data-cpuComponent="CU"
                  >
                    <g
                      style="filter: drop-shadow(rgba(0, 0, 0, 0.25) 2px 3px 2px);"
                    >
                      <rect
                        x="420"
                        y="58"
                        width="80"
                        height="100"
                        rx="12"
                        ry="12"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        text-anchor="middle"
                        font-size="16px"
                      >
                        <text x="459.5" y="105">Control</text>
                        <text x="459.5" y="124">Unit</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="HZNe9g323tp8alZJZz6p-2">
                <g
                  id="cell-HZNe9g323tp8alZJZz6p-2"
                  content='&lt;object label="4" cpuName="ADD4CT" cpuPath="ADD4CT"/&gt;'
                  data-label="4"
                  data-cpuName="ADD4CT"
                  data-cpuPath="ADD4CT"
                >
                  <g
                    id="cell-HZNe9g323tp8alZJZz6p-2"
                    content='&lt;object label="4" cpuName="ADD4CT" cpuPath="ADD4CT"/&gt;'
                    data-label="4"
                    data-cpuName="ADD4CT"
                    data-cpuPath="ADD4CT"
                  >
                    <g>
                      <path
                        d="M 144.76 37.85 L 155 37.91 L 164.9 38.08"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                      <path
                        d="M 171.65 38.19 L 162.57 42.54 L 164.9 38.08 L 162.72 33.54 Z"
                        fill="rgb(0, 0, 0)"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="12px"
                      >
                        <text x="137.3" y="41.35">4</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="3aQpnHwIqpuSFoxgzG9x-7">
                <g
                  id="cell-3aQpnHwIqpuSFoxgzG9x-7"
                  content='&lt;object label="ALUASrc" cpuName="SgnALUASrcPTH" cpuSignal="SgnALUASrcPTH"/&gt;'
                  data-label="ALUASrc"
                  data-cpuName="SgnALUASrcPTH"
                  data-cpuSignal="SgnALUASrcPTH"
                >
                  <g
                    id="cell-3aQpnHwIqpuSFoxgzG9x-7"
                    content='&lt;object label="ALUASrc" cpuName="SgnALUASrcPTH" cpuSignal="SgnALUASrcPTH"/&gt;'
                    data-label="ALUASrc"
                    data-cpuName="SgnALUASrcPTH"
                    data-cpuSignal="SgnALUASrcPTH"
                  >
                    <g>
                      <path
                        d="M 602.5 183 L 602.5 197.9"
                        fill="none"
                        stroke="#ff0000"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                      <path
                        d="M 602.5 204.65 L 598 195.65 L 602.5 197.9 L 607 195.65 Z"
                        fill="#ff0000"
                        stroke="#ff0000"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="#FF0000"
                        font-family='"Roboto Mono"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="11px"
                      >
                        <text x="602" y="180.36">ALUASrc</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="HZNe9g323tp8alZJZz6p-53">
                <g
                  id="cell-HZNe9g323tp8alZJZz6p-53"
                  content='&lt;object label="" cpuName="RUCLOCK" cpuComponent="RUCLOCK"/&gt;'
                  data-label=""
                  data-cpuName="RUCLOCK"
                  data-cpuComponent="RUCLOCK"
                >
                  <g
                    id="cell-HZNe9g323tp8alZJZz6p-53"
                    content='&lt;object label="" cpuName="RUCLOCK" cpuComponent="RUCLOCK"/&gt;'
                    data-label=""
                    data-cpuName="RUCLOCK"
                    data-cpuComponent="RUCLOCK"
                  >
                    <g>
                      <path
                        d="M 450 378 L 460 383 L 450 388 Z"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-miterlimit="10"
                        transform="rotate(-90,455,383)"
                        pointer-events="all"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="HZNe9g323tp8alZJZz6p-54">
                <g
                  id="cell-HZNe9g323tp8alZJZz6p-54"
                  content='&lt;object label="" cpuName="MEMCLOCK" cpuComponent="MEMCLOCK"/&gt;'
                  data-label=""
                  data-cpuName="MEMCLOCK"
                  data-cpuComponent="MEMCLOCK"
                >
                  <g
                    id="cell-HZNe9g323tp8alZJZz6p-54"
                    content='&lt;object label="" cpuName="MEMCLOCK" cpuComponent="MEMCLOCK"/&gt;'
                    data-label=""
                    data-cpuName="MEMCLOCK"
                    data-cpuComponent="MEMCLOCK"
                  >
                    <g>
                      <path
                        d="M 855 367 L 865 372 L 855 377 Z"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-miterlimit="10"
                        transform="rotate(-90,860,372)"
                        pointer-events="all"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="2nkxqfEYvfUEMSFPvkOz-6">
                <g
                  id="cell-2nkxqfEYvfUEMSFPvkOz-6"
                  content='&lt;object label="Address" cpuName="DMTEXTINADDRESS"/&gt;'
                  data-label="Address"
                  data-cpuName="DMTEXTINADDRESS"
                >
                  <g
                    id="cell-2nkxqfEYvfUEMSFPvkOz-6"
                    content='&lt;object label="Address" cpuName="DMTEXTINADDRESS"/&gt;'
                    data-label="Address"
                    data-cpuName="DMTEXTINADDRESS"
                  >
                    <g>
                      <rect
                        x="800"
                        y="287.13"
                        width="60"
                        height="20"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        font-style="italic"
                        font-size="12px"
                      >
                        <text x="801.5" y="301.63">Address</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="2nkxqfEYvfUEMSFPvkOz-7">
                <g
                  id="cell-2nkxqfEYvfUEMSFPvkOz-7"
                  content='&lt;object label="DataWr" cpuName="DMTEXTINDATAWR"/&gt;'
                  data-label="DataWr"
                  data-cpuName="DMTEXTINDATAWR"
                >
                  <g
                    id="cell-2nkxqfEYvfUEMSFPvkOz-7"
                    content='&lt;object label="DataWr" cpuName="DMTEXTINDATAWR"/&gt;'
                    data-label="DataWr"
                    data-cpuName="DMTEXTINDATAWR"
                  >
                    <g>
                      <rect
                        x="803"
                        y="315.62"
                        width="37"
                        height="20"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        font-style="italic"
                        font-size="12px"
                      >
                        <text x="804.5" y="330.12">DataWr</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="JjTASg2ex2UWmYMPivOh-2">
                <g
                  id="cell-JjTASg2ex2UWmYMPivOh-2"
                  content='&lt;object label="" cpuName="RUDM" cpuPath="RUDM"/&gt;'
                  data-label=""
                  data-cpuName="RUDM"
                  data-cpuPath="RUDM"
                >
                  <g
                    id="cell-JjTASg2ex2UWmYMPivOh-2"
                    content='&lt;object label="" cpuName="RUDM" cpuPath="RUDM"/&gt;'
                    data-label=""
                    data-cpuName="RUDM"
                    data-cpuPath="RUDM"
                  >
                    <g>
                      <path
                        d="M 510 332.9 L 540.03 332.89 L 540.03 448.03 L 545.03 448.03 C 545.03 441.53 555.03 441.53 555.03 448.03 L 555.03 448.03 L 780.03 448.03 L 780.03 414 C 786.53 414 786.53 404 780.03 404 L 780.03 404 L 780.03 325.23 L 789.9 325.21"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                      <path
                        d="M 796.65 325.2 L 787.65 329.72 L 789.9 325.21 L 787.64 320.72 Z"
                        fill="rgb(0, 0, 0)"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="all"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="JjTASg2ex2UWmYMPivOh-30">
                <g id="cell-JjTASg2ex2UWmYMPivOh-30">
                  <g id="cell-JjTASg2ex2UWmYMPivOh-30">
                    <g />
                  </g>
                </g>
              </g>
              <g data-cell-id="JjTASg2ex2UWmYMPivOh-32">
                <g
                  id="cell-JjTASg2ex2UWmYMPivOh-32"
                  content='&lt;object label="DMWr" cpuName="SgnDMWRPTH" cpuSignal="SgnDMWRPTH"/&gt;'
                  data-label="DMWr"
                  data-cpuName="SgnDMWRPTH"
                  data-cpuSignal="SgnDMWRPTH"
                >
                  <g
                    id="cell-JjTASg2ex2UWmYMPivOh-32"
                    content='&lt;object label="DMWr" cpuName="SgnDMWRPTH" cpuSignal="SgnDMWRPTH"/&gt;'
                    data-label="DMWr"
                    data-cpuName="SgnDMWRPTH"
                    data-cpuSignal="SgnDMWRPTH"
                  >
                    <g>
                      <path
                        d="M 830 189 L 830 207.9"
                        fill="none"
                        stroke="#ff0000"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                      <path
                        d="M 830 214.65 L 825.5 205.65 L 830 207.9 L 834.5 205.65 Z"
                        fill="#ff0000"
                        stroke="#ff0000"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="#FF0000"
                        font-family='"Roboto Mono"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="12px"
                      >
                        <text x="829.5" y="185.79">DMWr</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="JjTASg2ex2UWmYMPivOh-37">
                <g id="cell-JjTASg2ex2UWmYMPivOh-37">
                  <g id="cell-JjTASg2ex2UWmYMPivOh-37">
                    <g />
                  </g>
                </g>
              </g>
              <g data-cell-id="JjTASg2ex2UWmYMPivOh-39">
                <g
                  id="cell-JjTASg2ex2UWmYMPivOh-39"
                  content='&lt;object label="DMCtrl" cpuName="SgnDMCTRLPTH" cpuSignal="SgnDMCTRLPTH"/&gt;'
                  data-label="DMCtrl"
                  data-cpuName="SgnDMCTRLPTH"
                  data-cpuSignal="SgnDMCTRLPTH"
                >
                  <g
                    id="cell-JjTASg2ex2UWmYMPivOh-39"
                    content='&lt;object label="DMCtrl" cpuName="SgnDMCTRLPTH" cpuSignal="SgnDMCTRLPTH"/&gt;'
                    data-label="DMCtrl"
                    data-cpuName="SgnDMCTRLPTH"
                    data-cpuSignal="SgnDMCTRLPTH"
                  >
                    <g>
                      <path
                        d="M 890 188 L 890 207.9"
                        fill="none"
                        stroke="#ff0000"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                      <path
                        d="M 890 214.65 L 885.5 205.65 L 890 207.9 L 894.5 205.65 Z"
                        fill="#ff0000"
                        stroke="#ff0000"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="#FF0000"
                        font-family='"Roboto Mono"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="12px"
                      >
                        <text x="889.5" y="185.36">DMCtrl</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="JjTASg2ex2UWmYMPivOh-42">
                <g id="cell-JjTASg2ex2UWmYMPivOh-42">
                  <g id="cell-JjTASg2ex2UWmYMPivOh-42">
                    <g>
                      <rect
                        x="885"
                        y="192"
                        width="10"
                        height="10"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="#FF0000"
                        font-family='"Helvetica"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="10px"
                      >
                        <text x="889.5" y="200.5">-</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="mqPuQT_0QBacfXYGZUYs-19">
                <g
                  id="cell-mqPuQT_0QBacfXYGZUYs-19"
                  content='&lt;object label="ALUOp" cpuName="SgnALUOPPTH" cpuSignal="SgnALUOPPTH"/&gt;'
                  data-label="ALUOp"
                  data-cpuName="SgnALUOPPTH"
                  data-cpuSignal="SgnALUOPPTH"
                >
                  <g
                    id="cell-mqPuQT_0QBacfXYGZUYs-19"
                    content='&lt;object label="ALUOp" cpuName="SgnALUOPPTH" cpuSignal="SgnALUOPPTH"/&gt;'
                    data-label="ALUOp"
                    data-cpuName="SgnALUOPPTH"
                    data-cpuSignal="SgnALUOPPTH"
                  >
                    <g>
                      <path
                        d="M 697.93 393.61 L 698 412"
                        fill="none"
                        stroke="#ff0000"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                      <path
                        d="M 697.91 386.86 L 702.44 395.84 L 697.93 393.61 L 693.44 395.87 Z"
                        fill="#ff0000"
                        stroke="#ff0000"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="#FF0000"
                        font-family='"Roboto Mono"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="12px"
                      >
                        <text x="697.45" y="424.29">ALUOp</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="3aQpnHwIqpuSFoxgzG9x-20">
                <g
                  id="cell-3aQpnHwIqpuSFoxgzG9x-20"
                  content='&lt;object label="ALUBSrc" cpuName="SgnALUBSrcPTH" cpuSignal="SgnALUBSrcPTH"/&gt;'
                  data-label="ALUBSrc"
                  data-cpuName="SgnALUBSrcPTH"
                  data-cpuSignal="SgnALUBSrcPTH"
                >
                  <g
                    id="cell-3aQpnHwIqpuSFoxgzG9x-20"
                    content='&lt;object label="ALUBSrc" cpuName="SgnALUBSrcPTH" cpuSignal="SgnALUBSrcPTH"/&gt;'
                    data-label="ALUBSrc"
                    data-cpuName="SgnALUBSrcPTH"
                    data-cpuSignal="SgnALUBSrcPTH"
                  >
                    <g>
                      <path
                        d="M 602 395.1 L 602 409"
                        fill="none"
                        stroke="#ff0000"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                      <path
                        d="M 602 388.35 L 606.5 397.35 L 602 395.1 L 597.5 397.35 Z"
                        fill="#ff0000"
                        stroke="#ff0000"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="#FF0000"
                        font-family='"Roboto Mono"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="12px"
                      >
                        <text x="601.5" y="420.21">ALUBSrc</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="MFHekgNYJY3zWqpZmFK3-37">
                <g
                  id="cell-MFHekgNYJY3zWqpZmFK3-37"
                  content='&lt;object label="RUWr" cpuName="SgnRUWRPTH" cpuSignal="SgnRUWRPTH"/&gt;'
                  data-label="RUWr"
                  data-cpuName="SgnRUWRPTH"
                  data-cpuSignal="SgnRUWRPTH"
                >
                  <g
                    id="cell-MFHekgNYJY3zWqpZmFK3-37"
                    content='&lt;object label="RUWr" cpuName="SgnRUWRPTH" cpuSignal="SgnRUWRPTH"/&gt;'
                    data-label="RUWr"
                    data-cpuName="SgnRUWRPTH"
                    data-cpuSignal="SgnRUWRPTH"
                  >
                    <g>
                      <path
                        d="M 389.9 378.46 L 365.5 378.38"
                        fill="none"
                        stroke="#ff0000"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                      <path
                        d="M 396.65 378.49 L 387.63 382.96 L 389.9 378.46 L 387.66 373.96 Z"
                        fill="#ff0000"
                        stroke="#ff0000"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="#FF0000"
                        font-family='"Roboto Mono"'
                        font-weight="bold"
                        text-anchor="end"
                        font-size="11px"
                      >
                        <text x="363.21" y="382.38">RUWr</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="MFHekgNYJY3zWqpZmFK3-40">
                <g
                  id="cell-MFHekgNYJY3zWqpZmFK3-40"
                  content='&lt;object label="RUWR" cpuName="RUTEXTINWE"/&gt;'
                  data-label="RUWR"
                  data-cpuName="RUTEXTINWE"
                >
                  <g
                    id="cell-MFHekgNYJY3zWqpZmFK3-40"
                    content='&lt;object label="RUWR" cpuName="RUTEXTINWE"/&gt;'
                    data-label="RUWR"
                    data-cpuName="RUTEXTINWE"
                  >
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        font-style="italic"
                        font-size="12px"
                      >
                        <text x="401.5" y="380.19">RUWR</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="5p_Ua0qcicRBEdsBSy3l-40">
                <g
                  id="cell-5p_Ua0qcicRBEdsBSy3l-40"
                  content='&lt;object label="" cpuName="RUALUB" cpuPath="RUALUB"/&gt;'
                  data-label=""
                  data-cpuName="RUALUB"
                  data-cpuPath="RUALUB"
                >
                  <g
                    id="cell-5p_Ua0qcicRBEdsBSy3l-40"
                    content='&lt;object label="" cpuName="RUALUB" cpuPath="RUALUB"/&gt;'
                    data-label=""
                    data-cpuName="RUALUB"
                    data-cpuPath="RUALUB"
                  >
                    <g>
                      <path
                        d="M 569.4 332.97 L 510.03 332.89"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                      <path
                        d="M 576.15 332.98 L 567.14 337.46 L 569.4 332.97 L 567.15 328.46 Z"
                        fill="rgb(0, 0, 0)"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="all"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="F9JKnwVoIiv49AdzHxnh-71">
                <g
                  id="cell-F9JKnwVoIiv49AdzHxnh-71"
                  content='&lt;object label="" cpuName="RURS1BU" cpuPath="RURS1BU"/&gt;'
                  data-label=""
                  data-cpuName="RURS1BU"
                  data-cpuPath="RURS1BU"
                >
                  <g
                    id="cell-F9JKnwVoIiv49AdzHxnh-71"
                    content='&lt;object label="" cpuName="RURS1BU" cpuPath="RURS1BU"/&gt;'
                    data-label=""
                    data-cpuName="RURS1BU"
                    data-cpuPath="RURS1BU"
                  >
                    <g>
                      <path
                        d="M 510 257.9 L 550.03 257.91 L 550.03 183.03 C 556.53 183.03 556.53 173.03 550.03 173.03 L 550.03 173.03 L 550.03 153 L 549 153 L 549 133 L 624.9 133"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                      <path
                        d="M 631.65 133 L 622.65 137.5 L 624.9 133 L 622.65 128.5 Z"
                        fill="rgb(0, 0, 0)"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="all"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="F9JKnwVoIiv49AdzHxnh-72">
                <g
                  id="cell-F9JKnwVoIiv49AdzHxnh-72"
                  content='&lt;object label="" cpuName="RURS2BU" cpuPath="RURS2BU"/&gt;'
                  data-label=""
                  data-cpuName="RURS2BU"
                  data-cpuPath="RURS2BU"
                >
                  <g
                    id="cell-F9JKnwVoIiv49AdzHxnh-72"
                    content='&lt;object label="" cpuName="RURS2BU" cpuPath="RURS2BU"/&gt;'
                    data-label=""
                    data-cpuName="RURS2BU"
                    data-cpuPath="RURS2BU"
                  >
                    <g>
                      <path
                        d="M 510 332.9 L 531 332.89 L 531 257.91 L 531 257.87 L 531 183.03 C 537.5 183.03 537.5 173.03 531 173.03 L 531 173.03 L 531 103 L 624.9 103"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                      <path
                        d="M 631.65 103 L 622.65 107.5 L 624.9 103 L 622.65 98.5 Z"
                        fill="rgb(0, 0, 0)"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="all"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="oMHYYtl0w_-3aXBV-zV--1">
                <g
                  id="cell-oMHYYtl0w_-3aXBV-zV--1"
                  content='&lt;object label="" cpuName="IMGroup"/&gt;'
                  data-label=""
                  data-cpuName="IMGroup"
                >
                  <g
                    id="cell-oMHYYtl0w_-3aXBV-zV--1"
                    content='&lt;object label="" cpuName="IMGroup"/&gt;'
                    data-label=""
                    data-cpuName="IMGroup"
                  >
                    <g />
                  </g>
                </g>
                <g data-cell-id="F9JKnwVoIiv49AdzHxnh-5">
                  <g
                    id="cell-F9JKnwVoIiv49AdzHxnh-5"
                    content='&lt;object label="Instruction&amp;#10;Memory" cpuName="IM" cpuType="IM" cpuComponent="IM"/&gt;'
                    data-label="Instruction&#10;Memory"
                    data-cpuName="IM"
                    data-cpuType="IM"
                    data-cpuComponent="IM"
                  >
                    <g
                      id="cell-F9JKnwVoIiv49AdzHxnh-5"
                      content='&lt;object label="Instruction&amp;#10;Memory" cpuName="IM" cpuType="IM" cpuComponent="IM"/&gt;'
                      data-label="Instruction&#10;Memory"
                      data-cpuName="IM"
                      data-cpuType="IM"
                      data-cpuComponent="IM"
                    >
                      <g
                        style="filter: drop-shadow(rgba(0, 0, 0, 0.25) 2px 3px 2px);"
                      >
                        <rect
                          x="115"
                          y="248"
                          width="110"
                          height="110"
                          rx="16.5"
                          ry="16.5"
                          fill="none"
                          stroke="rgb(0, 0, 0)"
                          stroke-width="3"
                          pointer-events="all"
                        />
                      </g>
                      <g>
                        <g
                          fill="rgb(0, 0, 0)"
                          font-family='"Roboto Mono"'
                          text-anchor="middle"
                          font-size="16px"
                        >
                          <text x="169.5" y="269.5">Instruction</text>
                          <text x="169.5" y="288.5">Memory</text>
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
                <g data-cell-id="F9JKnwVoIiv49AdzHxnh-7">
                  <g
                    id="cell-F9JKnwVoIiv49AdzHxnh-7"
                    content='&lt;object label="Instruction" cpuName="IMINSTRUCTIONTEXT" cpuCompOut="IMINSTRUCTIONTEXT"/&gt;'
                    data-label="Instruction"
                    data-cpuName="IMINSTRUCTIONTEXT"
                    data-cpuCompOut="IMINSTRUCTIONTEXT"
                  >
                    <g
                      id="cell-F9JKnwVoIiv49AdzHxnh-7"
                      content='&lt;object label="Instruction" cpuName="IMINSTRUCTIONTEXT" cpuCompOut="IMINSTRUCTIONTEXT"/&gt;'
                      data-label="Instruction"
                      data-cpuName="IMINSTRUCTIONTEXT"
                      data-cpuCompOut="IMINSTRUCTIONTEXT"
                    >
                      <g>
                        <rect
                          x="125"
                          y="328"
                          width="95.5"
                          height="13"
                          fill="none"
                          stroke="none"
                          pointer-events="all"
                        />
                      </g>
                      <g>
                        <g
                          fill="rgb(0, 0, 0)"
                          font-family='"Roboto Mono"'
                          font-style="italic"
                          text-anchor="end"
                          font-size="12px"
                        >
                          <text x="218" y="339">Instruction</text>
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
                <g data-cell-id="HZNe9g323tp8alZJZz6p-5">
                  <g
                    id="cell-HZNe9g323tp8alZJZz6p-5"
                    content='&lt;object label="Address" cpuName="IMADDRESSTEXT" cpuCompIn="IMADDRESSTEXT"/&gt;'
                    data-label="Address"
                    data-cpuName="IMADDRESSTEXT"
                    data-cpuCompIn="IMADDRESSTEXT"
                  >
                    <g
                      id="cell-HZNe9g323tp8alZJZz6p-5"
                      content='&lt;object label="Address" cpuName="IMADDRESSTEXT" cpuCompIn="IMADDRESSTEXT"/&gt;'
                      data-label="Address"
                      data-cpuName="IMADDRESSTEXT"
                      data-cpuCompIn="IMADDRESSTEXT"
                    >
                      <g>
                        <rect
                          x="120"
                          y="298"
                          width="60"
                          height="11"
                          fill="none"
                          stroke="none"
                          pointer-events="all"
                        />
                      </g>
                      <g>
                        <g
                          fill="rgb(0, 0, 0)"
                          font-family='"Roboto Mono"'
                          font-style="italic"
                          font-size="12px"
                        >
                          <text x="119.5" y="308">Address</text>
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="oMHYYtl0w_-3aXBV-zV--12">
                <g
                  id="cell-oMHYYtl0w_-3aXBV-zV--12"
                  content='&lt;object label="BrOp" cpuName="SgnBUBROPPTH" cpuSignal="SgnBUBROPPTH"/&gt;'
                  data-label="BrOp"
                  data-cpuName="SgnBUBROPPTH"
                  data-cpuSignal="SgnBUBROPPTH"
                >
                  <g
                    id="cell-oMHYYtl0w_-3aXBV-zV--12"
                    content='&lt;object label="BrOp" cpuName="SgnBUBROPPTH" cpuSignal="SgnBUBROPPTH"/&gt;'
                    data-label="BrOp"
                    data-cpuName="SgnBUBROPPTH"
                    data-cpuSignal="SgnBUBROPPTH"
                  >
                    <g>
                      <path
                        d="M 686 158.1 L 686 179.38"
                        fill="none"
                        stroke="#ff0000"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                      <path
                        d="M 686 151.35 L 690.5 160.35 L 686 158.1 L 681.5 160.35 Z"
                        fill="#ff0000"
                        stroke="#ff0000"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="#FF0000"
                        font-family='"Roboto Mono"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="11px"
                      >
                        <text x="685.5" y="186.93">BrOp</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="oMHYYtl0w_-3aXBV-zV--24">
                <g
                  id="cell-oMHYYtl0w_-3aXBV-zV--24"
                  content='&lt;object label="" cpuName="CLKRU" cpuPath="CLKRU"/&gt;'
                  data-label=""
                  data-cpuName="CLKRU"
                  data-cpuPath="CLKRU"
                >
                  <g
                    id="cell-oMHYYtl0w_-3aXBV-zV--24"
                    content='&lt;object label="" cpuName="CLKRU" cpuPath="CLKRU"/&gt;'
                    data-label=""
                    data-cpuName="CLKRU"
                    data-cpuPath="CLKRU"
                  >
                    <g>
                      <path
                        d="M 49.71 439.5 L 259.03 439.51 C 259.03 433.01 269.03 433.01 269.03 439.51 L 269.03 439.51 L 315.03 439.51 C 315.03 433.01 325.03 433.01 325.03 439.51 L 325.03 439.51 L 455 439.51 L 455 398.1"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                      <path
                        d="M 455 391.35 L 459.5 400.35 L 455 398.1 L 450.5 400.35 Z"
                        fill="rgb(0, 0, 0)"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="all"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="oMHYYtl0w_-3aXBV-zV--25">
                <g
                  id="cell-oMHYYtl0w_-3aXBV-zV--25"
                  content='&lt;object label="" cpuName="CLKPC" cpuPath="CLKPC"/&gt;'
                  data-label=""
                  data-cpuName="CLKPC"
                  data-cpuPath="CLKPC"
                >
                  <g
                    id="cell-oMHYYtl0w_-3aXBV-zV--25"
                    content='&lt;object label="" cpuName="CLKPC" cpuPath="CLKPC"/&gt;'
                    data-label=""
                    data-cpuName="CLKPC"
                    data-cpuPath="CLKPC"
                  >
                    <g>
                      <path
                        d="M 29.36 411 L 29.91 348.1"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                      <path
                        d="M 29.97 341.35 L 34.39 350.39 L 29.91 348.1 L 25.39 350.31 Z"
                        fill="rgb(0, 0, 0)"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="all"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="oMHYYtl0w_-3aXBV-zV--26">
                <g
                  id="cell-oMHYYtl0w_-3aXBV-zV--26"
                  content='&lt;object label="" cpuName="CLKDM" cpuPath="CLKDM"/&gt;'
                  data-label=""
                  data-cpuName="CLKDM"
                  data-cpuPath="CLKDM"
                >
                  <g
                    id="cell-oMHYYtl0w_-3aXBV-zV--26"
                    content='&lt;object label="" cpuName="CLKDM" cpuPath="CLKDM"/&gt;'
                    data-label=""
                    data-cpuName="CLKDM"
                    data-cpuPath="CLKDM"
                  >
                    <g>
                      <path
                        d="M 49.71 439.5 L 259.03 439.5 C 259.03 433 269.03 433 269.03 439.5 L 269.03 439.5 L 315.03 439.5 C 315.03 433 325.03 433 325.03 439.5 L 325.03 439.5 L 535.03 439.51 C 535.03 433.01 545.03 433.01 545.03 439.51 L 545.03 439.51 L 545.03 439.51 C 545.03 433.01 555.03 433.01 555.03 439.51 L 555.03 439.51 L 775.03 439.51 C 775.03 433.01 785.03 433.01 785.03 439.51 L 785.03 439.51 L 860.03 439.51 L 860.02 414 C 866.52 414 866.51 404 860.01 404 L 860.01 404 L 860 388.1"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                      <path
                        d="M 860 381.35 L 864.51 390.35 L 860 388.1 L 855.51 390.36 Z"
                        fill="rgb(0, 0, 0)"
                        stroke="rgb(0, 0, 0)"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="all"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="oMHYYtl0w_-3aXBV-zV--27">
                <g id="cell-oMHYYtl0w_-3aXBV-zV--27">
                  <g id="cell-oMHYYtl0w_-3aXBV-zV--27">
                    <g
                      style="filter: drop-shadow(rgba(0, 0, 0, 0.25) 2px 3px 2px);"
                    />
                  </g>
                </g>
                <g data-cell-id="oMHYYtl0w_-3aXBV-zV--22">
                  <g
                    id="cell-oMHYYtl0w_-3aXBV-zV--22"
                    content='&lt;object label="CLK" cpuName="CLK" cpuComponent="CLK"/&gt;'
                    data-label="CLK"
                    data-cpuName="CLK"
                    data-cpuComponent="CLK"
                  >
                    <g
                      id="cell-oMHYYtl0w_-3aXBV-zV--22"
                      content='&lt;object label="CLK" cpuName="CLK" cpuComponent="CLK"/&gt;'
                      data-label="CLK"
                      data-cpuName="CLK"
                      data-cpuComponent="CLK"
                    >
                      <g
                        style="filter: drop-shadow(rgba(0, 0, 0, 0.25) 2px 3px 2px);"
                      >
                        <rect
                          x="9"
                          y="411"
                          width="40.71"
                          height="57"
                          rx="6.11"
                          ry="6.11"
                          fill="none"
                          stroke="rgb(0, 0, 0)"
                          stroke-opacity="0.9"
                          stroke-width="3"
                          pointer-events="all"
                        />
                      </g>
                      <g>
                        <g
                          fill="rgb(0, 0, 0)"
                          font-family='"Roboto Mono"'
                          text-anchor="middle"
                          font-size="16px"
                        >
                          <text x="28.86" y="432.5">CLK</text>
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
                <g data-cell-id="oMHYYtl0w_-3aXBV-zV--21">
                  <g
                    id="cell-oMHYYtl0w_-3aXBV-zV--21"
                    content='&lt;object label="" cpuName="CLKCLK"/&gt;'
                    data-label=""
                    data-cpuName="CLKCLK"
                  >
                    <g
                      id="cell-oMHYYtl0w_-3aXBV-zV--21"
                      content='&lt;object label="" cpuName="CLKCLK"/&gt;'
                      data-label=""
                      data-cpuName="CLKCLK"
                    >
                      <g
                        style="filter: drop-shadow(rgba(0, 0, 0, 0.25) 2px 3px 2px);"
                      >
                        <rect
                          x="21.01"
                          y="445.62"
                          width="16.68"
                          height="16.68"
                          fill="none"
                          stroke="none"
                          pointer-events="all"
                        />
                        <path
                          d="M 21.01 462.3 L 25.65 462.3 L 25.65 445.62 L 33.06 445.62 L 33.06 462.3 L 37.69 462.3"
                          fill="none"
                          stroke="rgb(0, 0, 0)"
                          stroke-width="3"
                          stroke-miterlimit="10"
                          pointer-events="all"
                        />
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="DU6Z1fBLgCM3MPrNrrz2-1">
                <g
                  id="cell-DU6Z1fBLgCM3MPrNrrz2-1"
                  content='&lt;object label="" cpuBusWidth="ADD4WBMUX"/&gt;'
                  data-label=""
                  data-cpuBusWidth="ADD4WBMUX"
                >
                  <g
                    id="cell-DU6Z1fBLgCM3MPrNrrz2-1"
                    content='&lt;object label="" cpuBusWidth="ADD4WBMUX"/&gt;'
                    data-label=""
                    data-cpuBusWidth="ADD4WBMUX"
                  >
                    <g>
                      <path
                        d="M 228 55 L 238 45"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="DU6Z1fBLgCM3MPrNrrz2-5">
                <g
                  id="cell-DU6Z1fBLgCM3MPrNrrz2-5"
                  content='&lt;object label="32" cpuBusWidth="ADD4WBMUX"/&gt;'
                  data-label="32"
                  data-cpuBusWidth="ADD4WBMUX"
                >
                  <g
                    id="cell-DU6Z1fBLgCM3MPrNrrz2-5"
                    content='&lt;object label="32" cpuBusWidth="ADD4WBMUX"/&gt;'
                    data-label="32"
                    data-cpuBusWidth="ADD4WBMUX"
                  >
                    <g>
                      <rect
                        x="233"
                        y="50"
                        width="10"
                        height="10"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="#FF0000"
                        font-family='"Helvetica"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="10px"
                      >
                        <text x="237.5" y="58.5">32</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="DU6Z1fBLgCM3MPrNrrz2-7">
                <g
                  id="cell-DU6Z1fBLgCM3MPrNrrz2-7"
                  content='&lt;object label="" cpuBusWidth="IMCUOPCODE"/&gt;'
                  data-label=""
                  data-cpuBusWidth="IMCUOPCODE"
                >
                  <g
                    id="cell-DU6Z1fBLgCM3MPrNrrz2-7"
                    content='&lt;object label="" cpuBusWidth="IMCUOPCODE"/&gt;'
                    data-label=""
                    data-cpuBusWidth="IMCUOPCODE"
                  >
                    <g>
                      <path
                        d="M 267 82 L 277 72"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="DU6Z1fBLgCM3MPrNrrz2-8">
                <g
                  id="cell-DU6Z1fBLgCM3MPrNrrz2-8"
                  content='&lt;object label="7" cpuBusWidth="IMCUOPCODE"/&gt;'
                  data-label="7"
                  data-cpuBusWidth="IMCUOPCODE"
                >
                  <g
                    id="cell-DU6Z1fBLgCM3MPrNrrz2-8"
                    content='&lt;object label="7" cpuBusWidth="IMCUOPCODE"/&gt;'
                    data-label="7"
                    data-cpuBusWidth="IMCUOPCODE"
                  >
                    <g>
                      <rect
                        x="272"
                        y="77"
                        width="10"
                        height="10"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="#FF0000"
                        font-family='"Helvetica"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="10px"
                      >
                        <text x="276.5" y="85.5">7</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="DU6Z1fBLgCM3MPrNrrz2-9">
                <g
                  id="cell-DU6Z1fBLgCM3MPrNrrz2-9"
                  content='&lt;object label="" cpuBusWidth="IMCUFUNCT3"/&gt;'
                  data-label=""
                  data-cpuBusWidth="IMCUFUNCT3"
                >
                  <g
                    id="cell-DU6Z1fBLgCM3MPrNrrz2-9"
                    content='&lt;object label="" cpuBusWidth="IMCUFUNCT3"/&gt;'
                    data-label=""
                    data-cpuBusWidth="IMCUFUNCT3"
                  >
                    <g>
                      <path
                        d="M 266 114 L 276 104"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="DU6Z1fBLgCM3MPrNrrz2-10">
                <g
                  id="cell-DU6Z1fBLgCM3MPrNrrz2-10"
                  content='&lt;object label="3" cpuBusWidth="IMCUFUNCT3"/&gt;'
                  data-label="3"
                  data-cpuBusWidth="IMCUFUNCT3"
                >
                  <g
                    id="cell-DU6Z1fBLgCM3MPrNrrz2-10"
                    content='&lt;object label="3" cpuBusWidth="IMCUFUNCT3"/&gt;'
                    data-label="3"
                    data-cpuBusWidth="IMCUFUNCT3"
                  >
                    <g>
                      <rect
                        x="271"
                        y="109"
                        width="10"
                        height="10"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="#FF0000"
                        font-family='"Helvetica"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="10px"
                      >
                        <text x="275.5" y="117.5">3</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="DU6Z1fBLgCM3MPrNrrz2-11">
                <g
                  id="cell-DU6Z1fBLgCM3MPrNrrz2-11"
                  content='&lt;object label="" cpuBusWidth="IMCUFUNCT7"/&gt;'
                  data-label=""
                  data-cpuBusWidth="IMCUFUNCT7"
                >
                  <g
                    id="cell-DU6Z1fBLgCM3MPrNrrz2-11"
                    content='&lt;object label="" cpuBusWidth="IMCUFUNCT7"/&gt;'
                    data-label=""
                    data-cpuBusWidth="IMCUFUNCT7"
                  >
                    <g>
                      <path
                        d="M 266 146 L 276 136"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="DU6Z1fBLgCM3MPrNrrz2-12">
                <g
                  id="cell-DU6Z1fBLgCM3MPrNrrz2-12"
                  content='&lt;object label="7" cpuBusWidth="IMCUFUNCT7"/&gt;'
                  data-label="7"
                  data-cpuBusWidth="IMCUFUNCT7"
                >
                  <g
                    id="cell-DU6Z1fBLgCM3MPrNrrz2-12"
                    content='&lt;object label="7" cpuBusWidth="IMCUFUNCT7"/&gt;'
                    data-label="7"
                    data-cpuBusWidth="IMCUFUNCT7"
                  >
                    <g>
                      <rect
                        x="271"
                        y="141"
                        width="10"
                        height="10"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="#FF0000"
                        font-family='"Helvetica"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="10px"
                      >
                        <text x="275.5" y="149.5">7</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="DU6Z1fBLgCM3MPrNrrz2-15">
                <g
                  id="cell-DU6Z1fBLgCM3MPrNrrz2-15"
                  content='&lt;object label="" cpuBusWidth="IMRURS1"/&gt;'
                  data-label=""
                  data-cpuBusWidth="IMRURS1"
                >
                  <g
                    id="cell-DU6Z1fBLgCM3MPrNrrz2-15"
                    content='&lt;object label="" cpuBusWidth="IMRURS1"/&gt;'
                    data-label=""
                    data-cpuBusWidth="IMRURS1"
                  >
                    <g>
                      <path
                        d="M 267 228 L 277 218"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="DU6Z1fBLgCM3MPrNrrz2-16">
                <g
                  id="cell-DU6Z1fBLgCM3MPrNrrz2-16"
                  content='&lt;object label="5" cpuBusWidth="IMRURS1"/&gt;'
                  data-label="5"
                  data-cpuBusWidth="IMRURS1"
                >
                  <g
                    id="cell-DU6Z1fBLgCM3MPrNrrz2-16"
                    content='&lt;object label="5" cpuBusWidth="IMRURS1"/&gt;'
                    data-label="5"
                    data-cpuBusWidth="IMRURS1"
                  >
                    <g>
                      <rect
                        x="272"
                        y="223"
                        width="10"
                        height="10"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="#FF0000"
                        font-family='"Helvetica"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="10px"
                      >
                        <text x="276.5" y="231.5">5</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="DU6Z1fBLgCM3MPrNrrz2-18">
                <g
                  id="cell-DU6Z1fBLgCM3MPrNrrz2-18"
                  content='&lt;object label="" cpuBusWidth="IMRURS2"/&gt;'
                  data-label=""
                  data-cpuBusWidth="IMRURS2"
                >
                  <g
                    id="cell-DU6Z1fBLgCM3MPrNrrz2-18"
                    content='&lt;object label="" cpuBusWidth="IMRURS2"/&gt;'
                    data-label=""
                    data-cpuBusWidth="IMRURS2"
                  >
                    <g>
                      <path
                        d="M 267 263 L 277 253"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="DU6Z1fBLgCM3MPrNrrz2-19">
                <g
                  id="cell-DU6Z1fBLgCM3MPrNrrz2-19"
                  content='&lt;object label="5" cpuBusWidth="IMRURS2"/&gt;'
                  data-label="5"
                  data-cpuBusWidth="IMRURS2"
                >
                  <g
                    id="cell-DU6Z1fBLgCM3MPrNrrz2-19"
                    content='&lt;object label="5" cpuBusWidth="IMRURS2"/&gt;'
                    data-label="5"
                    data-cpuBusWidth="IMRURS2"
                  >
                    <g>
                      <rect
                        x="272"
                        y="258"
                        width="10"
                        height="10"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="#FF0000"
                        font-family='"Helvetica"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="10px"
                      >
                        <text x="276.5" y="266.5">5</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="DU6Z1fBLgCM3MPrNrrz2-20">
                <g
                  id="cell-DU6Z1fBLgCM3MPrNrrz2-20"
                  content='&lt;object label="" cpuBusWidth="IMRURD"/&gt;'
                  data-label=""
                  data-cpuBusWidth="IMRURD"
                >
                  <g
                    id="cell-DU6Z1fBLgCM3MPrNrrz2-20"
                    content='&lt;object label="" cpuBusWidth="IMRURD"/&gt;'
                    data-label=""
                    data-cpuBusWidth="IMRURD"
                  >
                    <g>
                      <path
                        d="M 267 344.38 L 277 334.38"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="DU6Z1fBLgCM3MPrNrrz2-21">
                <g
                  id="cell-DU6Z1fBLgCM3MPrNrrz2-21"
                  content='&lt;object label="5" cpuBusWidth="IMRURD"/&gt;'
                  data-label="5"
                  data-cpuBusWidth="IMRURD"
                >
                  <g
                    id="cell-DU6Z1fBLgCM3MPrNrrz2-21"
                    content='&lt;object label="5" cpuBusWidth="IMRURD"/&gt;'
                    data-label="5"
                    data-cpuBusWidth="IMRURD"
                  >
                    <g>
                      <rect
                        x="272"
                        y="339.38"
                        width="10"
                        height="10"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="#FF0000"
                        font-family='"Helvetica"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="10px"
                      >
                        <text x="276.5" y="347.88">5</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="DU6Z1fBLgCM3MPrNrrz2-22">
                <g
                  id="cell-DU6Z1fBLgCM3MPrNrrz2-22"
                  content='&lt;object label="" cpuBusWidth="IMRU"/&gt;'
                  data-label=""
                  data-cpuBusWidth="IMRU"
                >
                  <g
                    id="cell-DU6Z1fBLgCM3MPrNrrz2-22"
                    content='&lt;object label="" cpuBusWidth="IMRU"/&gt;'
                    data-label=""
                    data-cpuBusWidth="IMRU"
                  >
                    <g>
                      <path
                        d="M 228 344.38 L 238 334.38"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="DU6Z1fBLgCM3MPrNrrz2-23">
                <g
                  id="cell-DU6Z1fBLgCM3MPrNrrz2-23"
                  content='&lt;object label="32" cpuBusWidth="IMRU"/&gt;'
                  data-label="32"
                  data-cpuBusWidth="IMRU"
                >
                  <g
                    id="cell-DU6Z1fBLgCM3MPrNrrz2-23"
                    content='&lt;object label="32" cpuBusWidth="IMRU"/&gt;'
                    data-label="32"
                    data-cpuBusWidth="IMRU"
                  >
                    <g>
                      <rect
                        x="233"
                        y="339.38"
                        width="10"
                        height="10"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="#FF0000"
                        font-family='"Helvetica"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="10px"
                      >
                        <text x="237.5" y="347.88">32</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="DU6Z1fBLgCM3MPrNrrz2-24">
                <g
                  id="cell-DU6Z1fBLgCM3MPrNrrz2-24"
                  content='&lt;object label="" cpuBusWidth="IMIMM"/&gt;'
                  data-label=""
                  data-cpuBusWidth="IMIMM"
                >
                  <g
                    id="cell-DU6Z1fBLgCM3MPrNrrz2-24"
                    content='&lt;object label="" cpuBusWidth="IMIMM"/&gt;'
                    data-label=""
                    data-cpuBusWidth="IMIMM"
                  >
                    <g>
                      <path
                        d="M 267 487 L 277 477"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="DU6Z1fBLgCM3MPrNrrz2-25">
                <g
                  id="cell-DU6Z1fBLgCM3MPrNrrz2-25"
                  content='&lt;object label="25" cpuBusWidth="IMIMM"/&gt;'
                  data-label="25"
                  data-cpuBusWidth="IMIMM"
                >
                  <g
                    id="cell-DU6Z1fBLgCM3MPrNrrz2-25"
                    content='&lt;object label="25" cpuBusWidth="IMIMM"/&gt;'
                    data-label="25"
                    data-cpuBusWidth="IMIMM"
                  >
                    <g>
                      <rect
                        x="272"
                        y="482"
                        width="10"
                        height="10"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="#FF0000"
                        font-family='"Helvetica"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="10px"
                      >
                        <text x="276.5" y="490.5">25</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="DU6Z1fBLgCM3MPrNrrz2-27">
                <g
                  id="cell-DU6Z1fBLgCM3MPrNrrz2-27"
                  content='&lt;object label="MUX" cpuName="BUMUXTEXT" cpuPathLabel="BUMUXTEXT"/&gt;'
                  data-label="MUX"
                  data-cpuName="BUMUXTEXT"
                  data-cpuPathLabel="BUMUXTEXT"
                >
                  <g
                    id="cell-DU6Z1fBLgCM3MPrNrrz2-27"
                    content='&lt;object label="MUX" cpuName="BUMUXTEXT" cpuPathLabel="BUMUXTEXT"/&gt;'
                    data-label="MUX"
                    data-cpuName="BUMUXTEXT"
                    data-cpuPathLabel="BUMUXTEXT"
                  >
                    <g>
                      <rect
                        x="933"
                        y="24"
                        width="28"
                        height="10"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        font-weight="bold"
                        font-size="14px"
                      >
                        <text x="934.5" y="34.5">MUX</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="DU6Z1fBLgCM3MPrNrrz2-28">
                <g
                  id="cell-DU6Z1fBLgCM3MPrNrrz2-28"
                  content='&lt;object label="MUX" cpuName="WBMUXTEXT" cpuPathLabel="WBMUXTEXT"/&gt;'
                  data-label="MUX"
                  data-cpuName="WBMUXTEXT"
                  data-cpuPathLabel="WBMUXTEXT"
                >
                  <g
                    id="cell-DU6Z1fBLgCM3MPrNrrz2-28"
                    content='&lt;object label="MUX" cpuName="WBMUXTEXT" cpuPathLabel="WBMUXTEXT"/&gt;'
                    data-label="MUX"
                    data-cpuName="WBMUXTEXT"
                    data-cpuPathLabel="WBMUXTEXT"
                  >
                    <g>
                      <rect
                        x="981.17"
                        y="290"
                        width="28"
                        height="10"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        font-weight="bold"
                        font-size="14px"
                      >
                        <text x="982.67" y="300.5">MUX</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="DU6Z1fBLgCM3MPrNrrz2-29">
                <g
                  id="cell-DU6Z1fBLgCM3MPrNrrz2-29"
                  content='&lt;object label="MUX" cpuName="ALUBMUXTEXT" cpuPathLabel="ALUBMUXTEXT"/&gt;'
                  data-label="MUX"
                  data-cpuName="ALUBMUXTEXT"
                  data-cpuPathLabel="ALUBMUXTEXT"
                >
                  <g
                    id="cell-DU6Z1fBLgCM3MPrNrrz2-29"
                    content='&lt;object label="MUX" cpuName="ALUBMUXTEXT" cpuPathLabel="ALUBMUXTEXT"/&gt;'
                    data-label="MUX"
                    data-cpuName="ALUBMUXTEXT"
                    data-cpuPathLabel="ALUBMUXTEXT"
                  >
                    <g>
                      <rect
                        x="588"
                        y="311"
                        width="28"
                        height="10"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        font-weight="bold"
                        font-size="14px"
                      >
                        <text x="589.5" y="321.5">MUX</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="DU6Z1fBLgCM3MPrNrrz2-30">
                <g
                  id="cell-DU6Z1fBLgCM3MPrNrrz2-30"
                  content='&lt;object label="MUX" cpuName="ALUAMUXTEXT" cpuPathLabel="ALUAMUXTEXT"/&gt;'
                  data-label="MUX"
                  data-cpuName="ALUAMUXTEXT"
                  data-cpuPathLabel="ALUAMUXTEXT"
                >
                  <g
                    id="cell-DU6Z1fBLgCM3MPrNrrz2-30"
                    content='&lt;object label="MUX" cpuName="ALUAMUXTEXT" cpuPathLabel="ALUAMUXTEXT"/&gt;'
                    data-label="MUX"
                    data-cpuName="ALUAMUXTEXT"
                    data-cpuPathLabel="ALUAMUXTEXT"
                  >
                    <g>
                      <rect
                        x="588.5"
                        y="272"
                        width="28"
                        height="10"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        font-weight="bold"
                        font-size="14px"
                      >
                        <text x="590" y="282.5">MUX</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="DU6Z1fBLgCM3MPrNrrz2-31">
                <g
                  id="cell-DU6Z1fBLgCM3MPrNrrz2-31"
                  content='&lt;object label="" cpuBusWidth="IMMALUB"/&gt;'
                  data-label=""
                  data-cpuBusWidth="IMMALUB"
                >
                  <g
                    id="cell-DU6Z1fBLgCM3MPrNrrz2-31"
                    content='&lt;object label="" cpuBusWidth="IMMALUB"/&gt;'
                    data-label=""
                    data-cpuBusWidth="IMMALUB"
                  >
                    <g>
                      <path
                        d="M 515 500 L 525 490"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="DU6Z1fBLgCM3MPrNrrz2-32">
                <g
                  id="cell-DU6Z1fBLgCM3MPrNrrz2-32"
                  content='&lt;object label="32" cpuBusWidth="IMMALUB"/&gt;'
                  data-label="32"
                  data-cpuBusWidth="IMMALUB"
                >
                  <g
                    id="cell-DU6Z1fBLgCM3MPrNrrz2-32"
                    content='&lt;object label="32" cpuBusWidth="IMMALUB"/&gt;'
                    data-label="32"
                    data-cpuBusWidth="IMMALUB"
                  >
                    <g>
                      <rect
                        x="521"
                        y="495"
                        width="10"
                        height="10"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="#FF0000"
                        font-family='"Helvetica"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="10px"
                      >
                        <text x="525.5" y="503.5">32</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="DU6Z1fBLgCM3MPrNrrz2-33">
                <g
                  id="cell-DU6Z1fBLgCM3MPrNrrz2-33"
                  content='&lt;object label="" cpuBusWidth="IMMSRC"/&gt;'
                  data-label=""
                  data-cpuBusWidth="IMMSRC"
                >
                  <g
                    id="cell-DU6Z1fBLgCM3MPrNrrz2-33"
                    content='&lt;object label="" cpuBusWidth="IMMSRC"/&gt;'
                    data-label=""
                    data-cpuBusWidth="IMMSRC"
                  >
                    <g>
                      <path
                        d="M 372 515 L 382 505"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="DU6Z1fBLgCM3MPrNrrz2-34">
                <g
                  id="cell-DU6Z1fBLgCM3MPrNrrz2-34"
                  content='&lt;object label="3" cpuBusWidth="IMMSRC"/&gt;'
                  data-label="3"
                  data-cpuBusWidth="IMMSRC"
                >
                  <g
                    id="cell-DU6Z1fBLgCM3MPrNrrz2-34"
                    content='&lt;object label="3" cpuBusWidth="IMMSRC"/&gt;'
                    data-label="3"
                    data-cpuBusWidth="IMMSRC"
                  >
                    <g>
                      <rect
                        x="377"
                        y="510"
                        width="10"
                        height="10"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="#FF0000"
                        font-family='"Helvetica"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="10px"
                      >
                        <text x="381.5" y="518.5">3</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="DU6Z1fBLgCM3MPrNrrz2-35">
                <g
                  id="cell-DU6Z1fBLgCM3MPrNrrz2-35"
                  content='&lt;object label="" cpuBusWidth="RURD2"/&gt;'
                  data-label=""
                  data-cpuBusWidth="RURD2"
                >
                  <g
                    id="cell-DU6Z1fBLgCM3MPrNrrz2-35"
                    content='&lt;object label="" cpuBusWidth="RURD2"/&gt;'
                    data-label=""
                    data-cpuBusWidth="RURD2"
                  >
                    <g>
                      <path
                        d="M 513 338.5 L 523 328.5"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="DU6Z1fBLgCM3MPrNrrz2-36">
                <g
                  id="cell-DU6Z1fBLgCM3MPrNrrz2-36"
                  content='&lt;object label="32" cpuBusWidth="RURD2"/&gt;'
                  data-label="32"
                  data-cpuBusWidth="RURD2"
                >
                  <g
                    id="cell-DU6Z1fBLgCM3MPrNrrz2-36"
                    content='&lt;object label="32" cpuBusWidth="RURD2"/&gt;'
                    data-label="32"
                    data-cpuBusWidth="RURD2"
                  >
                    <g>
                      <rect
                        x="518"
                        y="333.5"
                        width="10"
                        height="10"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="#FF0000"
                        font-family='"Helvetica"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="10px"
                      >
                        <text x="522.5" y="342">32</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="DU6Z1fBLgCM3MPrNrrz2-37">
                <g
                  id="cell-DU6Z1fBLgCM3MPrNrrz2-37"
                  content='&lt;object label="" cpuBusWidth="RURD1"/&gt;'
                  data-label=""
                  data-cpuBusWidth="RURD1"
                >
                  <g
                    id="cell-DU6Z1fBLgCM3MPrNrrz2-37"
                    content='&lt;object label="" cpuBusWidth="RURD1"/&gt;'
                    data-label=""
                    data-cpuBusWidth="RURD1"
                  >
                    <g>
                      <path
                        d="M 512 264 L 522 254"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="DU6Z1fBLgCM3MPrNrrz2-38">
                <g
                  id="cell-DU6Z1fBLgCM3MPrNrrz2-38"
                  content='&lt;object label="32" cpuBusWidth="RURD1"/&gt;'
                  data-label="32"
                  data-cpuBusWidth="RURD1"
                >
                  <g
                    id="cell-DU6Z1fBLgCM3MPrNrrz2-38"
                    content='&lt;object label="32" cpuBusWidth="RURD1"/&gt;'
                    data-label="32"
                    data-cpuBusWidth="RURD1"
                  >
                    <g>
                      <rect
                        x="517"
                        y="259"
                        width="10"
                        height="10"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="#FF0000"
                        font-family='"Helvetica"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="10px"
                      >
                        <text x="521.5" y="267.5">32</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="DU6Z1fBLgCM3MPrNrrz2-39">
                <g
                  id="cell-DU6Z1fBLgCM3MPrNrrz2-39"
                  content='&lt;object label="" cpuBusWidth="ALUAALU"/&gt;'
                  data-label=""
                  data-cpuBusWidth="ALUAALU"
                >
                  <g
                    id="cell-DU6Z1fBLgCM3MPrNrrz2-39"
                    content='&lt;object label="" cpuBusWidth="ALUAALU"/&gt;'
                    data-label=""
                    data-cpuBusWidth="ALUAALU"
                  >
                    <g>
                      <path
                        d="M 627.5 245 L 637.5 235"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="DU6Z1fBLgCM3MPrNrrz2-40">
                <g
                  id="cell-DU6Z1fBLgCM3MPrNrrz2-40"
                  content='&lt;object label="32" cpuBusWidth="ALUAALU"/&gt;'
                  data-label="32"
                  data-cpuBusWidth="ALUAALU"
                >
                  <g
                    id="cell-DU6Z1fBLgCM3MPrNrrz2-40"
                    content='&lt;object label="32" cpuBusWidth="ALUAALU"/&gt;'
                    data-label="32"
                    data-cpuBusWidth="ALUAALU"
                  >
                    <g>
                      <rect
                        x="632.5"
                        y="240"
                        width="10"
                        height="10"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="#FF0000"
                        font-family='"Helvetica"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="10px"
                      >
                        <text x="637" y="248.5">32</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="DU6Z1fBLgCM3MPrNrrz2-41">
                <g
                  id="cell-DU6Z1fBLgCM3MPrNrrz2-41"
                  content='&lt;object label="" cpuBusWidth="ALUBALU"/&gt;'
                  data-label=""
                  data-cpuBusWidth="ALUBALU"
                >
                  <g
                    id="cell-DU6Z1fBLgCM3MPrNrrz2-41"
                    content='&lt;object label="" cpuBusWidth="ALUBALU"/&gt;'
                    data-label=""
                    data-cpuBusWidth="ALUBALU"
                  >
                    <g>
                      <path
                        d="M 627 360 L 637 350"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="DU6Z1fBLgCM3MPrNrrz2-42">
                <g
                  id="cell-DU6Z1fBLgCM3MPrNrrz2-42"
                  content='&lt;object label="32" cpuBusWidth="ALUBALU"/&gt;'
                  data-label="32"
                  data-cpuBusWidth="ALUBALU"
                >
                  <g
                    id="cell-DU6Z1fBLgCM3MPrNrrz2-42"
                    content='&lt;object label="32" cpuBusWidth="ALUBALU"/&gt;'
                    data-label="32"
                    data-cpuBusWidth="ALUBALU"
                  >
                    <g>
                      <rect
                        x="632"
                        y="355"
                        width="10"
                        height="10"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="#FF0000"
                        font-family='"Helvetica"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="10px"
                      >
                        <text x="636.5" y="363.5">32</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="KmmFxrSkwYLAUQcPx1Sv-9">
                <g
                  id="cell-KmmFxrSkwYLAUQcPx1Sv-9"
                  content='&lt;object label="" cpuBusWidth="SgnDMCTRLPTH"/&gt;'
                  data-label=""
                  data-cpuBusWidth="SgnDMCTRLPTH"
                >
                  <g
                    id="cell-KmmFxrSkwYLAUQcPx1Sv-9"
                    content='&lt;object label="" cpuBusWidth="SgnDMCTRLPTH"/&gt;'
                    data-label=""
                    data-cpuBusWidth="SgnDMCTRLPTH"
                  >
                    <g>
                      <path
                        d="M 886 201.38 L 896 191.38"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="KmmFxrSkwYLAUQcPx1Sv-10">
                <g
                  id="cell-KmmFxrSkwYLAUQcPx1Sv-10"
                  content='&lt;object label="3" cpuBusWidth="SgnDMCTRLPTH"/&gt;'
                  data-label="3"
                  data-cpuBusWidth="SgnDMCTRLPTH"
                >
                  <g
                    id="cell-KmmFxrSkwYLAUQcPx1Sv-10"
                    content='&lt;object label="3" cpuBusWidth="SgnDMCTRLPTH"/&gt;'
                    data-label="3"
                    data-cpuBusWidth="SgnDMCTRLPTH"
                  >
                    <g>
                      <rect
                        x="895"
                        y="190"
                        width="10"
                        height="10"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="#FF0000"
                        font-family='"Helvetica"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="10px"
                      >
                        <text x="899.5" y="198.5">3</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="KmmFxrSkwYLAUQcPx1Sv-11">
                <g
                  id="cell-KmmFxrSkwYLAUQcPx1Sv-11"
                  content='&lt;object label="" cpuBusWidth="SgnDMCTRLPTH"/&gt;'
                  data-label=""
                  data-cpuBusWidth="SgnDMCTRLPTH"
                >
                  <g
                    id="cell-KmmFxrSkwYLAUQcPx1Sv-11"
                    content='&lt;object label="" cpuBusWidth="SgnDMCTRLPTH"/&gt;'
                    data-label=""
                    data-cpuBusWidth="SgnDMCTRLPTH"
                  >
                    <g>
                      <path
                        d="M 693 410.38 L 703 400.38"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="KmmFxrSkwYLAUQcPx1Sv-12">
                <g
                  id="cell-KmmFxrSkwYLAUQcPx1Sv-12"
                  content='&lt;object label="4" cpuBusWidth="SgnDMCTRLPTH"/&gt;'
                  data-label="4"
                  data-cpuBusWidth="SgnDMCTRLPTH"
                >
                  <g
                    id="cell-KmmFxrSkwYLAUQcPx1Sv-12"
                    content='&lt;object label="4" cpuBusWidth="SgnDMCTRLPTH"/&gt;'
                    data-label="4"
                    data-cpuBusWidth="SgnDMCTRLPTH"
                  >
                    <g>
                      <rect
                        x="702"
                        y="399"
                        width="10"
                        height="10"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="#FF0000"
                        font-family='"Helvetica"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="10px"
                      >
                        <text x="706.5" y="407.5">4</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="KmmFxrSkwYLAUQcPx1Sv-13">
                <g
                  id="cell-KmmFxrSkwYLAUQcPx1Sv-13"
                  content='&lt;object label="" cpuBusWidth="SgnDMCTRLPTH"/&gt;'
                  data-label=""
                  data-cpuBusWidth="SgnDMCTRLPTH"
                >
                  <g
                    id="cell-KmmFxrSkwYLAUQcPx1Sv-13"
                    content='&lt;object label="" cpuBusWidth="SgnDMCTRLPTH"/&gt;'
                    data-label=""
                    data-cpuBusWidth="SgnDMCTRLPTH"
                  >
                    <g>
                      <path
                        d="M 681 176.38 L 691 166.38"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="KmmFxrSkwYLAUQcPx1Sv-14">
                <g
                  id="cell-KmmFxrSkwYLAUQcPx1Sv-14"
                  content='&lt;object label="5" cpuBusWidth="SgnBUBROPPTH"/&gt;'
                  data-label="5"
                  data-cpuBusWidth="SgnBUBROPPTH"
                >
                  <g
                    id="cell-KmmFxrSkwYLAUQcPx1Sv-14"
                    content='&lt;object label="5" cpuBusWidth="SgnBUBROPPTH"/&gt;'
                    data-label="5"
                    data-cpuBusWidth="SgnBUBROPPTH"
                  >
                    <g>
                      <rect
                        x="690"
                        y="165"
                        width="10"
                        height="10"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="#FF0000"
                        font-family='"Helvetica"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="10px"
                      >
                        <text x="694.5" y="173.5">5</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="KmmFxrSkwYLAUQcPx1Sv-19">
                <g
                  id="cell-KmmFxrSkwYLAUQcPx1Sv-19"
                  content='&lt;object label="" cpuBusWidth="ALUDM"/&gt;'
                  data-label=""
                  data-cpuBusWidth="ALUDM"
                >
                  <g
                    id="cell-KmmFxrSkwYLAUQcPx1Sv-19"
                    content='&lt;object label="" cpuBusWidth="ALUDM"/&gt;'
                    data-label=""
                    data-cpuBusWidth="ALUDM"
                  >
                    <g>
                      <path
                        d="M 743 304 L 753 294"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="KmmFxrSkwYLAUQcPx1Sv-20">
                <g
                  id="cell-KmmFxrSkwYLAUQcPx1Sv-20"
                  content='&lt;object label="32" cpuBusWidth="ALUDM"/&gt;'
                  data-label="32"
                  data-cpuBusWidth="ALUDM"
                >
                  <g
                    id="cell-KmmFxrSkwYLAUQcPx1Sv-20"
                    content='&lt;object label="32" cpuBusWidth="ALUDM"/&gt;'
                    data-label="32"
                    data-cpuBusWidth="ALUDM"
                  >
                    <g>
                      <rect
                        x="748"
                        y="299"
                        width="10"
                        height="10"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="#FF0000"
                        font-family='"Helvetica"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="10px"
                      >
                        <text x="752.5" y="307.5">32</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="KmmFxrSkwYLAUQcPx1Sv-21">
                <g
                  id="cell-KmmFxrSkwYLAUQcPx1Sv-21"
                  content='&lt;object label="" cpuBusWidth="DMWBMUX"/&gt;'
                  data-label=""
                  data-cpuBusWidth="DMWBMUX"
                >
                  <g
                    id="cell-KmmFxrSkwYLAUQcPx1Sv-21"
                    content='&lt;object label="" cpuBusWidth="DMWBMUX"/&gt;'
                    data-label=""
                    data-cpuBusWidth="DMWBMUX"
                  >
                    <g>
                      <path
                        d="M 922 345 L 932 335"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="KmmFxrSkwYLAUQcPx1Sv-22">
                <g
                  id="cell-KmmFxrSkwYLAUQcPx1Sv-22"
                  content='&lt;object label="32" cpuBusWidth="DMWBMUX"/&gt;'
                  data-label="32"
                  data-cpuBusWidth="DMWBMUX"
                >
                  <g
                    id="cell-KmmFxrSkwYLAUQcPx1Sv-22"
                    content='&lt;object label="32" cpuBusWidth="DMWBMUX"/&gt;'
                    data-label="32"
                    data-cpuBusWidth="DMWBMUX"
                  >
                    <g>
                      <rect
                        x="927"
                        y="340"
                        width="10"
                        height="10"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="#FF0000"
                        font-family='"Helvetica"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="10px"
                      >
                        <text x="931.5" y="348.5">32</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="KmmFxrSkwYLAUQcPx1Sv-23">
                <g
                  id="cell-KmmFxrSkwYLAUQcPx1Sv-23"
                  content='&lt;object label="" cpuBusWidth="BUMUXPC"/&gt;'
                  data-label=""
                  data-cpuBusWidth="BUMUXPC"
                >
                  <g
                    id="cell-KmmFxrSkwYLAUQcPx1Sv-23"
                    content='&lt;object label="" cpuBusWidth="BUMUXPC"/&gt;'
                    data-label=""
                    data-cpuBusWidth="BUMUXPC"
                  >
                    <g>
                      <path
                        d="M 971 75 L 981 65"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="KmmFxrSkwYLAUQcPx1Sv-24">
                <g
                  id="cell-KmmFxrSkwYLAUQcPx1Sv-24"
                  content='&lt;object label="32" cpuBusWidth="BUMUXPC"/&gt;'
                  data-label="32"
                  data-cpuBusWidth="BUMUXPC"
                >
                  <g
                    id="cell-KmmFxrSkwYLAUQcPx1Sv-24"
                    content='&lt;object label="32" cpuBusWidth="BUMUXPC"/&gt;'
                    data-label="32"
                    data-cpuBusWidth="BUMUXPC"
                  >
                    <g>
                      <rect
                        x="976"
                        y="70"
                        width="10"
                        height="10"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="#FF0000"
                        font-family='"Helvetica"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="10px"
                      >
                        <text x="980.5" y="78.5">32</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="KmmFxrSkwYLAUQcPx1Sv-30">
                <g
                  id="cell-KmmFxrSkwYLAUQcPx1Sv-30"
                  content='&lt;object label="" cpuBusWidth="PCIM"/&gt;'
                  data-label=""
                  data-cpuBusWidth="PCIM"
                >
                  <g
                    id="cell-KmmFxrSkwYLAUQcPx1Sv-30"
                    content='&lt;object label="" cpuBusWidth="PCIM"/&gt;'
                    data-label=""
                    data-cpuBusWidth="PCIM"
                  >
                    <g>
                      <path
                        d="M 59 310 L 69 300"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="KmmFxrSkwYLAUQcPx1Sv-31">
                <g
                  id="cell-KmmFxrSkwYLAUQcPx1Sv-31"
                  content='&lt;object label="32" cpuBusWidth="PCIM"/&gt;'
                  data-label="32"
                  data-cpuBusWidth="PCIM"
                >
                  <g
                    id="cell-KmmFxrSkwYLAUQcPx1Sv-31"
                    content='&lt;object label="32" cpuBusWidth="PCIM"/&gt;'
                    data-label="32"
                    data-cpuBusWidth="PCIM"
                  >
                    <g>
                      <rect
                        x="64"
                        y="305"
                        width="10"
                        height="10"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="#FF0000"
                        font-family='"Helvetica"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="10px"
                      >
                        <text x="68.5" y="313.5">32</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="Cam9CdJ7jOMB4I3tXhEt-1">
                <g
                  id="cell-Cam9CdJ7jOMB4I3tXhEt-1"
                  content='&lt;object label="" cpuBusWidth="WBMUXRU"/&gt;'
                  data-label=""
                  data-cpuBusWidth="WBMUXRU"
                >
                  <g
                    id="cell-Cam9CdJ7jOMB4I3tXhEt-1"
                    content='&lt;object label="" cpuBusWidth="WBMUXRU"/&gt;'
                    data-label=""
                    data-cpuBusWidth="WBMUXRU"
                  >
                    <g>
                      <path
                        d="M 1022 345 L 1032 335"
                        fill="none"
                        stroke="rgb(0, 0, 0)"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="Cam9CdJ7jOMB4I3tXhEt-2">
                <g
                  id="cell-Cam9CdJ7jOMB4I3tXhEt-2"
                  content='&lt;object label="32" cpuBusWidth="WBMUXRU"/&gt;'
                  data-label="32"
                  data-cpuBusWidth="WBMUXRU"
                >
                  <g
                    id="cell-Cam9CdJ7jOMB4I3tXhEt-2"
                    content='&lt;object label="32" cpuBusWidth="WBMUXRU"/&gt;'
                    data-label="32"
                    data-cpuBusWidth="WBMUXRU"
                  >
                    <g>
                      <rect
                        x="1027"
                        y="340"
                        width="10"
                        height="10"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="#FF0000"
                        font-family='"Helvetica"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="10px"
                      >
                        <text x="1031.5" y="348.5">32</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="Cam9CdJ7jOMB4I3tXhEt-3">
                <g
                  id="cell-Cam9CdJ7jOMB4I3tXhEt-3"
                  content='&lt;object label="00000" cpuSignal="SgnBUBROPVAL" cpuName="SgnBUBROPVAL"/&gt;'
                  data-label="00000"
                  data-cpuSignal="SgnBUBROPVAL"
                  data-cpuName="SgnBUBROPVAL"
                >
                  <g
                    id="cell-Cam9CdJ7jOMB4I3tXhEt-3"
                    content='&lt;object label="00000" cpuSignal="SgnBUBROPVAL" cpuName="SgnBUBROPVAL"/&gt;'
                    data-label="00000"
                    data-cpuSignal="SgnBUBROPVAL"
                    data-cpuName="SgnBUBROPVAL"
                  >
                    <g>
                      <rect
                        x="702"
                        y="165"
                        width="39"
                        height="14"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="12px"
                      >
                        <text x="721" y="176.5">00000</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="Cam9CdJ7jOMB4I3tXhEt-4">
                <g
                  id="cell-Cam9CdJ7jOMB4I3tXhEt-4"
                  content='&lt;object label="0" cpuSignal="SgnRUWRVAL" cpuName="SgnRUWRVAL"/&gt;'
                  data-label="0"
                  data-cpuSignal="SgnRUWRVAL"
                  data-cpuName="SgnRUWRVAL"
                >
                  <g
                    id="cell-Cam9CdJ7jOMB4I3tXhEt-4"
                    content='&lt;object label="0" cpuSignal="SgnRUWRVAL" cpuName="SgnRUWRVAL"/&gt;'
                    data-label="0"
                    data-cpuSignal="SgnRUWRVAL"
                    data-cpuName="SgnRUWRVAL"
                  >
                    <g>
                      <rect
                        x="339"
                        y="384"
                        width="26"
                        height="13"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="12px"
                      >
                        <text x="351.5" y="395">0</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="Cam9CdJ7jOMB4I3tXhEt-5">
                <g
                  id="cell-Cam9CdJ7jOMB4I3tXhEt-5"
                  content='&lt;object label="0" cpuSignal="SgnDMWRVAL" cpuName="SgnDMWRVAL"/&gt;'
                  data-label="0"
                  data-cpuSignal="SgnDMWRVAL"
                  data-cpuName="SgnDMWRVAL"
                >
                  <g
                    id="cell-Cam9CdJ7jOMB4I3tXhEt-5"
                    content='&lt;object label="0" cpuSignal="SgnDMWRVAL" cpuName="SgnDMWRVAL"/&gt;'
                    data-label="0"
                    data-cpuSignal="SgnDMWRVAL"
                    data-cpuName="SgnDMWRVAL"
                  >
                    <g>
                      <rect
                        x="838"
                        y="189"
                        width="11"
                        height="13"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="12px"
                      >
                        <text x="843" y="200">0</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="Cam9CdJ7jOMB4I3tXhEt-6">
                <g
                  id="cell-Cam9CdJ7jOMB4I3tXhEt-6"
                  content='&lt;object label="000" cpuSignal="SgnDMCTRLVAL" cpuName="SgnDMCTRLVAL"/&gt;'
                  data-label="000"
                  data-cpuSignal="SgnDMCTRLVAL"
                  data-cpuName="SgnDMCTRLVAL"
                >
                  <g
                    id="cell-Cam9CdJ7jOMB4I3tXhEt-6"
                    content='&lt;object label="000" cpuSignal="SgnDMCTRLVAL" cpuName="SgnDMCTRLVAL"/&gt;'
                    data-label="000"
                    data-cpuSignal="SgnDMCTRLVAL"
                    data-cpuName="SgnDMCTRLVAL"
                  >
                    <g>
                      <rect
                        x="907"
                        y="189.5"
                        width="26"
                        height="13"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="12px"
                      >
                        <text x="919.5" y="200.5">000</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="Cam9CdJ7jOMB4I3tXhEt-7">
                <g
                  id="cell-Cam9CdJ7jOMB4I3tXhEt-7"
                  content='&lt;object label="0000" cpuSignal="SgnALUOPVAL" cpuName="SgnALUOPVAL"/&gt;'
                  data-label="0000"
                  data-cpuSignal="SgnALUOPVAL"
                  data-cpuName="SgnALUOPVAL"
                >
                  <g
                    id="cell-Cam9CdJ7jOMB4I3tXhEt-7"
                    content='&lt;object label="0000" cpuSignal="SgnALUOPVAL" cpuName="SgnALUOPVAL"/&gt;'
                    data-label="0000"
                    data-cpuSignal="SgnALUOPVAL"
                    data-cpuName="SgnALUOPVAL"
                  >
                    <g>
                      <rect
                        x="714"
                        y="399"
                        width="39"
                        height="14"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="12px"
                      >
                        <text x="733" y="410.5">0000</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="Cam9CdJ7jOMB4I3tXhEt-8">
                <g
                  id="cell-Cam9CdJ7jOMB4I3tXhEt-8"
                  content='&lt;object label="000" cpuSignal="SgnIMMSRCVAL" cpuName="SgnIMMSRCVAL"/&gt;'
                  data-label="000"
                  data-cpuSignal="SgnIMMSRCVAL"
                  data-cpuName="SgnIMMSRCVAL"
                >
                  <g
                    id="cell-Cam9CdJ7jOMB4I3tXhEt-8"
                    content='&lt;object label="000" cpuSignal="SgnIMMSRCVAL" cpuName="SgnIMMSRCVAL"/&gt;'
                    data-label="000"
                    data-cpuSignal="SgnIMMSRCVAL"
                    data-cpuName="SgnIMMSRCVAL"
                  >
                    <g>
                      <rect
                        x="325"
                        y="515"
                        width="42"
                        height="13"
                        fill="none"
                        stroke="none"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="rgb(0, 0, 0)"
                        font-family='"Roboto Mono"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="12px"
                      >
                        <text x="345.5" y="526">000</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="5a7DwLPF6NLdoc_h5jQR-2">
                <g
                  id="cell-5a7DwLPF6NLdoc_h5jQR-2"
                  content='&lt;object label="IMMSrc" cpuName="SgnIMMSrcPTH" cpuSignal="SgnIMMSrcPTH"/&gt;'
                  data-label="IMMSrc"
                  data-cpuName="SgnIMMSrcPTH"
                  data-cpuSignal="SgnIMMSrcPTH"
                >
                  <g
                    id="cell-5a7DwLPF6NLdoc_h5jQR-2"
                    content='&lt;object label="IMMSrc" cpuName="SgnIMMSrcPTH" cpuSignal="SgnIMMSrcPTH"/&gt;'
                    data-label="IMMSrc"
                    data-cpuName="SgnIMMSrcPTH"
                    data-cpuSignal="SgnIMMSrcPTH"
                  >
                    <g>
                      <path
                        d="M 389.9 508.36 L 363 508"
                        fill="none"
                        stroke="#ff0000"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                      <path
                        d="M 396.65 508.45 L 387.59 512.83 L 389.9 508.36 L 387.71 503.83 Z"
                        fill="#ff0000"
                        stroke="#ff0000"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="#FF0000"
                        font-family='"Roboto Mono"'
                        font-weight="bold"
                        text-anchor="end"
                        font-size="11px"
                      >
                        <text x="360.36" y="512">IMMSrc</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g data-cell-id="5a7DwLPF6NLdoc_h5jQR-4">
                <g
                  id="cell-5a7DwLPF6NLdoc_h5jQR-4"
                  content='&lt;object label="RUDataWrSrc" cpuName="SgnWBPTH" cpuSignal="SgnWBPTH"/&gt;'
                  data-label="RUDataWrSrc"
                  data-cpuName="SgnWBPTH"
                  data-cpuSignal="SgnWBPTH"
                >
                  <g
                    id="cell-5a7DwLPF6NLdoc_h5jQR-4"
                    content='&lt;object label="RUDataWrSrc" cpuName="SgnWBPTH" cpuSignal="SgnWBPTH"/&gt;'
                    data-label="RUDataWrSrc"
                    data-cpuName="SgnWBPTH"
                    data-cpuSignal="SgnWBPTH"
                  >
                    <g>
                      <path
                        d="M 994.85 383.79 L 995 401"
                        fill="none"
                        stroke="#ff0000"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="stroke"
                      />
                      <path
                        d="M 994.79 377.04 L 999.37 386 L 994.85 383.79 L 990.37 386.08 Z"
                        fill="#ff0000"
                        stroke="#ff0000"
                        stroke-width="3"
                        stroke-miterlimit="10"
                        pointer-events="all"
                      />
                    </g>
                    <g>
                      <g
                        fill="#FF0000"
                        font-family='"Roboto Mono"'
                        font-weight="bold"
                        text-anchor="middle"
                        font-size="12px"
                      >
                        <text x="994.34" y="409.33">RUDataWrSrc</text>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </g>
        </g>
      </svg>
    `;

    const tooltipString = /*html*/ `
      <div
        id="tooltip"
        role="tooltip"
        class="border border-primary rounded px-2 py-1 bg-white"
      >
        tooltip
        <div id="arrow"></div>
      </div>
    `;

    const modalString = /*html*/ `
      <div class="modal" id="simulator-modal">
        <div class="modal-dialog">
          <div class="modal-content">
            <!-- Modal Header -->
            <div class="modal-header">
              <h4 class="modal-title" id="simulator-modal-title">
                Simulation finished
              </h4>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <!-- Modal body -->
            <div class="modal-body" id="simulator-modal-body">
              The simulation has finished. You can save the current status of
              the memory and registers before performing a new simulation.
              Statistics:
            </div>
            <!-- Modal footer -->
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-primary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const toolBarString = /*html*/ `
      <div class="simulator-toolbar toolbar-container d-flex justify-content-between">
        <div
          class="btn-group btn-group-sm"
          role="group"
          aria-label="Basic example"
        >
          <button
            id="step-execution"
            type="button"
            class="btn btn-outline-primary"
          >
            <span
              class="d-flex justify-content-center align-items-center codicon codicon-debug-step-over"
            ></span>
          </button>
          <button
            id="restart-execution"
            type="button"
            class="btn btn-outline-primary"
          >
            <span
              class="d-flex justify-content-center align-items-center codicon codicon-debug-restart"
            ></span>
          </button>
          <button
            id="inspect-registers"
            type="button"
            class="btn btn-outline-primary"
          >
            <span
              class="d-flex justify-content-center align-items-center codicon codicon-archive"
            ></span>
          </button>
          <button id="export-svg" type="button" class="btn btn-outline-primary">
            <span
              class="d-flex justify-content-center align-items-center codicon codicon-export"
            ></span>
          </button>
        </div>
        <div class="btn-group btn-group-sm" role="group">
          <div>
            <label class="text-mutted" id="instruction-asm"></span>
          </div>
          <div>
            <label class="text-mutted ms-4" id="instruction-bin"></span>
          </div>
        </div>
        <div
          class="btn-group me-2 btn-group-sm"
          role="group"
          aria-label="Instruction type"
        >
          <button id="instruction-type-r" type="button" class="btn btn-primary">
            <span class="d-flex justify-content-center align-items-center"
              >R</span
            >
          </button>
          <button id="instruction-type-i" type="button" class="btn btn-primary">
            <span class="d-flex justify-content-center align-items-center"
              >I</span
            >
          </button>
          <button id="instruction-type-s" type="button" class="btn btn-primary">
            <span class="d-flex justify-content-center align-items-center"
              >S</span
            >
          </button>
          <button id="instruction-type-b" type="button" class="btn btn-primary">
            <span class="d-flex justify-content-center align-items-center"
              >B</span
            >
          </button>
          <button id="instruction-type-u" type="button" class="btn btn-primary">
            <span class="d-flex justify-content-center align-items-center"
              >U</span
            >
          </button>
          <button id="instruction-type-j" type="button" class="btn btn-primary">
            <span class="d-flex justify-content-center align-items-center"
              >J</span
            >
          </button>
        </div>
      </div>
    `;

    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <link rel="stylesheet" , href="${bootstrapCSS}" />
          <link rel="stylesheet" , href="${cssFile}" />
          <link rel="stylesheet" , href="${codiconsUri}" />
        </head>
        <body>
          ${tooltipString} ${modalString}
          <div id="simulator-view">
            <div>${toolBarString}</div>
            <div class="svg-div">${svgString}</div>
          </div>
          <script
            type="module"
            nonce="${nonce}"
            src="${webviewUri}"
            async
          ></script>
        </body>
      </html>
    `;

    return /*html*/ `
     <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
      />
    <link rel="stylesheet" , href="${bootstrapCSS}" />
    <link rel="stylesheet" , href="${cssFile}" />
    <link rel="stylesheet" , href="${codiconsUri}" />
  </head>
  <body class="p-1">
    ${'' /*tooltipString*/}
    ${'' /*modalString*/}
    ${'' /*toolBarString*/}
    <div class="container-fluid">    
      ${svgString}
    </div>
      ${'' /*bottomBar*/}
    <!-- end grid container -->
    <script type="module" nonce="${nonce}" src="${webviewUri}"></script>
  </body>
</html>
    `;
  }

  /**
   * Sets up an event listener to listen for messages passed from the webview context and
   * executes code based on the message that is recieved.
   *
   * @param webview A reference to the extension webview
   */
  private _setWebviewMessageListener(webview: Webview) {
    webview.onDidReceiveMessage(
      (message: any) => {
        const command = message.command;
        switch (command) {
          case 'info':
            console.log('info ', message.obj);
            break;
          // default:
          // console.error("Message not recognized", message);
        }
      },
      undefined,
      this._disposables
    );
  }
  public postMessage(message: Object) {
    SimulatorPanel.currentPanel?._panel.webview.postMessage(message);
  }
}
