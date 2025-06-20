/* eslint-disable @typescript-eslint/naming-convention */

import {
  commands,
  Disposable,
  ExtensionContext,
  Webview,
  window,
  TextEditor,
  ViewColumn,
  Uri,
  WebviewPanel,
  WebviewView,
} from "vscode";

import { getHtmlForGraphicSimulator } from "../simulators/graphicSimulator/provider";
import { getHtmlForTextSimulator } from "../simulators/textSimulator/provider";
import { RiscCardPanel } from "../simulators/instructionSet/provider";
import { activateMessageListenerForRegistersView } from "../utilities/activateMessageListener";

import { RVDocument } from "../rvDocument";
import { EncoderDecorator } from "../encoderDecorator";
import { ConfigurationManager } from "./configurationManager";
import { SimulationParameters, Simulator, TextSimulator, GraphicSimulator } from "../Simulator";

export class RVContext {
  static #instance: RVContext | null;

  private extensionContext: ExtensionContext;
  private disposables: Disposable[];
  private _configurationManager: ConfigurationManager;
  private _encoderDecorator: EncoderDecorator | undefined;

  // --- SEPARATE REFERENCES FOR EACH WEBVIEW TYPE ---
  private _textWebview: Webview | undefined;
  private _graphicWebviewPanel: WebviewPanel | undefined;

  private _currentDocument: RVDocument | undefined;
  private _isSimulating = false;

  // --- SINGLE ACTIVE SIMULATOR INSTANCE ---
  private _simulator: Simulator | undefined;

  get configurationManager(): ConfigurationManager {
    return this._configurationManager;
  }

  get encoderDecorator(): EncoderDecorator | undefined {
    return this._encoderDecorator;
  }

  get simulator(): Simulator {
    if (!this._simulator) throw new Error("Simulator not initialized.");
    return this._simulator;
  }

  static create(context: ExtensionContext): RVContext {
    if (!RVContext.#instance) {
      RVContext.#instance = new RVContext(context);
    }
    return RVContext.#instance;
  }

  private constructor(context: ExtensionContext) {
    this.extensionContext = context;
    this.disposables = [];
    this._configurationManager = new ConfigurationManager();

    this.registerTextWebviewProvider();
    this.registerCommands();
    this.setupEditorListeners();

    commands.executeCommand("setContext", "ext.isSimulating", false);
  }

  private registerTextWebviewProvider() {
    this.disposables.push(
      window.registerWebviewViewProvider(
        "rv-simulator.riscv",
        {
          resolveWebviewView: async (webviewView: WebviewView) => {
            webviewView.webview.options = {
              enableScripts: true,
              localResourceRoots: [this.extensionContext.extensionUri],
            };
            webviewView.title = "Registers and memory view";
            webviewView.webview.html = await getHtmlForTextSimulator(
              webviewView.webview,
              this.extensionContext.extensionUri
            );

            this._textWebview = webviewView.webview;
            activateMessageListenerForRegistersView(webviewView.webview, this);

            webviewView.onDidDispose(() => {
              this._textWebview = undefined;
              // If the text simulator was active, stop it when its panel closes
              if (
                this._simulator instanceof TextSimulator &&
                !(this._simulator instanceof GraphicSimulator)
              ) {
                this.cleanupSimulator();
              }
            });
          },
        },
        { webviewOptions: { retainContextWhenHidden: true } }
      )
    );
  }

  private registerCommands() {
    this.disposables.push(
      // --- COMMAND FOR GRAPHIC SIMULATOR ---
      commands.registerCommand("rv-simulator.simulate", async () => {
        const editor = window.activeTextEditor;
        if (!editor || !RVDocument.isValid(editor.document)) {
          return window.showErrorMessage("No valid RISC-V document open");
        }

        // 1. FORCE-CLOSE THE TEXT VIEW (BOTTOM PANEL)
        await commands.executeCommand("workbench.action.closePanel");

        // 2. STOP ANY PREVIOUS SIMULATOR AND CLEAN STATE
        this.cleanupSimulator();
        // Also close any previously open graphic panel
        this._graphicWebviewPanel?.dispose();

        this.buildCurrentDocument();
        if (!this._currentDocument || !this._currentDocument.ir) return;

        const panel = window.createWebviewPanel(
          "riscCard",
          "RISC-V Graphic Simulator",
          ViewColumn.One,
          {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [
              Uri.joinPath(this.extensionContext.extensionUri, "node_modules"),
              Uri.joinPath(this.extensionContext.extensionUri, "src/templates"),
              Uri.joinPath(this.extensionContext.extensionUri, "out"),
            ],
          }
        );

        this._graphicWebviewPanel = panel;

        // 3. SIMULATION STOPS WHEN GRAPHIC PANEL IS CLOSED
        panel.onDidDispose(() => {
          this._graphicWebviewPanel = undefined;
          this.cleanupSimulator();
        });

        panel.webview.html = await getHtmlForGraphicSimulator(
          panel.webview,
          this.extensionContext.extensionUri
        );
        activateMessageListenerForRegistersView(panel.webview, this);

        // 4. CREATE AND START THE GRAPHIC SIMULATOR WITH ITS OWN WEBVIEW
        const settings: SimulationParameters = { memorySize: 40 };
        this._simulator = new GraphicSimulator(
          settings,
          this._currentDocument,
          this,
          panel.webview
        );

        this._isSimulating = true;
        commands.executeCommand("setContext", "ext.isSimulating", true);
        this._simulator.start();
      }),

      // --- COMMAND FOR TEXT SIMULATOR ---
      commands.registerCommand("rv-simulator.textSimulate", () => {
        const editor = window.activeTextEditor;
        if (!editor || !RVDocument.isValid(editor.document)) {
          return window.showErrorMessage("No valid RISC-V document open");
        }
        if (!this._textWebview) {
          commands.executeCommand("rv-simulator.riscv.focus");
          return window.showWarningMessage(
            "Text simulator view is now open. Please press 'Text Simulate' again."
          );
        }

        // 1. CLOSE GRAPHIC VIEW IF OPEN
        this._graphicWebviewPanel?.dispose();

        // 2. STOP ANY PREVIOUS SIMULATOR AND CLEAN STATE
        this.cleanupSimulator();

        commands.executeCommand("rv-simulator.riscv.focus");
        this.buildCurrentDocument();
        if (!this._currentDocument || !this._currentDocument.ir) return;

        // 3. CREATE AND START THE TEXT SIMULATOR WITH ITS OWN WEBVIEW
        const settings: SimulationParameters = { memorySize: 40 };
        this._simulator = new TextSimulator(
          settings,
          this._currentDocument,
          this,
          this._textWebview
        );

        this._isSimulating = true;
        commands.executeCommand("setContext", "ext.isSimulating", true);
        this._simulator.start();
      }),

      // --- SIMULATION CONTROL COMMANDS ---
      commands.registerCommand("rv-simulator.simulateStep", () => {
        this._simulator?.step();
      }),

      commands.registerCommand("rv-simulator.simulateStop", () => {
        this.cleanupSimulator();
        this._graphicWebviewPanel?.dispose(); // Ensure graphic panel is also closed
      }),

      commands.registerCommand("rv-simulator.build", () => {
        this.buildCurrentDocument();
      })
    );
  }

  private setupEditorListeners() {
    this.disposables.push(window.onDidChangeActiveTextEditor(() => this.buildCurrentDocument()));
    this.extensionContext.subscriptions.push({
      dispose: () => this.disposables.reverse().forEach((d) => d.dispose()),
    });
  }

  private buildCurrentDocument() {
    const editor = window.activeTextEditor;
    if (editor?.document.languageId === "riscvasm") {
      if (!this._encoderDecorator) {
        this._encoderDecorator = new EncoderDecorator();
      }
      this._currentDocument = new RVDocument(editor, this);
      this._currentDocument.buildAndDecorate(this);
    }
  }

  private cleanupSimulator() {
    if (!this._simulator) {
      return;
    }

    const simulatorToStop = this._simulator;

    this._simulator = undefined;
    this._isSimulating = false;
    commands.executeCommand("setContext", "ext.isSimulating", false);

    simulatorToStop.stop();

    this.clearEncoderDecorations();
  }

  public clearEncoderDecorations() {
    if (this._encoderDecorator && window.activeTextEditor) {
      this._encoderDecorator.clearDecorations(window.activeTextEditor);
    }
    this._encoderDecorator = undefined;
  }

  private step() {
    this.simulator?.step();
  }

  private stop() {
    this.cleanupSimulator();
    this._graphicWebviewPanel?.dispose();
  }

  private animateLine(line: number) {
    this.simulator?.animateLine(line);
  }

  private memorySizeChanged(newSize: number) {
    this.simulator?.resizeMemory(newSize);
  }

  private registersChanged(newRegisters: string[]) {
    this.simulator?.replaceRegisters(newRegisters);
  }

  private memoryChanged(newMemory: []) {
    this.simulator?.replaceMemory(newMemory);
  }

  public resetEncoderDecorator(editor: TextEditor): void {
    this._encoderDecorator?.clearDecorations(editor);
    this._encoderDecorator = undefined;
  }

  public dispatchMainViewEvent(message: any) {
    if (message.event === "clickOpenRISCVCard") {
      RiscCardPanel.riscCard(this.extensionContext.extensionUri);
      return;
    }
    // All events are forwarded to the only active simulator. If none, ignore.
    if (!this._simulator) return;

    switch (message.event) {
      case "step":
        this.step();
        break;
      case "stop":
        this.stop();
        break;
      case "clickInInstruction":
        this.animateLine(message.value);
        break;
      case "memorySizeChanged":
        this.memorySizeChanged(message.value);
        break;
      case "registersChanged":
        this.registersChanged(message.value);
        break;
      case "memoryChanged":
        this.memoryChanged(message.value);
        break;
      default:
        console.log("[Mainview - unknown event]", message);
        break;
    }
  }
}
