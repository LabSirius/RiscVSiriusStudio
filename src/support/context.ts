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

/**
 * Manages the state and logic for the entire RISC-V Simulator extension.
 * It handles webviews, commands, and the active simulator instance.
 */
export class RVContext {
  // --- Singleton Instance ---
  static #instance: RVContext | null;

  // --- Core Extension Properties ---
  private extensionContext: ExtensionContext;
  private disposables: Disposable[];
  private _configurationManager: ConfigurationManager;
  private _encoderDecorator: EncoderDecorator | undefined;

  // --- Webview and Panel References ---
  private _textWebview: Webview | undefined;
  private _graphicWebviewPanel: WebviewPanel | undefined;

  // --- Simulation State ---
  private _simulatorType: "monocycle" | "pipeline" = "monocycle";
  private _currentDocument: RVDocument | undefined;
  private _isSimulating = false;
  private _simulator: Simulator | undefined;
  private _madeReadonlyOnce = false;
  private _hasWebviewInitialized = false;

  // =================================================================
  //  1. Singleton and Constructor
  // =================================================================

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

    this.registerWebviewProvider();
    this.registerCommands();
    this.setupEditorListeners();

    commands.executeCommand("setContext", "ext.isSimulating", false);
  }

  // =================================================================
  //  2. Public Getters
  // =================================================================

  public get configurationManager(): ConfigurationManager {
    return this._configurationManager;
  }
  public get encoderDecorator(): EncoderDecorator | undefined {
    return this._encoderDecorator;
  }
  public get simulator(): Simulator {
    if (!this._simulator) throw new Error("Simulator not initialized.");
    return this._simulator;
  }

  // =================================================================
  //  3. Extension Setup
  // =================================================================

  private registerCommands() {
    this.disposables.push(
      commands.registerCommand("rv-simulator.simulate", async () => {
        if (this._graphicWebviewPanel) {
          this._graphicWebviewPanel.reveal(ViewColumn.One);
          return;
        }
        const environmentReady = await this.prepareForGraphicSimulation();
        if (!environmentReady) return;
        const panel = await this.createAndConfigureGraphicPanel();
        await this.initializeAndStartGraphicSimulator(panel);
      }),
      commands.registerCommand("rv-simulator.textSimulate", () => {
        const environmentReady = this.prepareForTextSimulation();
        if (!environmentReady) return;
        this.initializeAndStartTextSimulator();
      }),
      commands.registerCommand("rv-simulator.simulateStep", () => this.step()),
      commands.registerCommand("rv-simulator.simulateReset", () => this.resetSimulator()),
      commands.registerCommand("rv-simulator.simulateStop", () => {
        this.stop();
        this._graphicWebviewPanel?.dispose();
      }),
      commands.registerCommand("rv-simulator.build", () => this.buildCurrentDocument())
    );
  }

  private registerWebviewProvider() {
    commands.executeCommand("rv-simulator.riscv.focus");
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
              if (
                this._simulator instanceof TextSimulator &&
                !(this._simulator instanceof GraphicSimulator)
              ) {
                this.cleanupSimulator({ sendStopMessage: true });
              }
            });
          },
        },
        { webviewOptions: { retainContextWhenHidden: true } }
      )
    );
  }

  private setupEditorListeners() {
    this.disposables.push(
      window.onDidChangeActiveTextEditor((editor) => {
        if (this._simulator && this._isSimulating) this.buildCurrentDocument();
        if (editor?.document.languageId === "riscvasm") {
          if (!this._isSimulating && !this._madeReadonlyOnce) {
            commands.executeCommand("workbench.action.files.toggleActiveEditorReadonlyInSession");
            this._madeReadonlyOnce = true;
          }
        }
      })
    );
    this.extensionContext.subscriptions.push({
      dispose: () => this.disposables.reverse().forEach((d) => d.dispose()),
    });
  }

  // =================================================================
  //  4. Simulation Lifecycle Handlers
  // =================================================================

  private async prepareForGraphicSimulation(): Promise<boolean> {
    this._madeReadonlyOnce = false;
    const editor = window.activeTextEditor;
    if (!editor || !RVDocument.isValid(editor.document)) {
      window.showErrorMessage("No valid RISC-V document open");
      return false;
    }
    await commands.executeCommand("workbench.action.closePanel");
    this.cleanupSimulator({ sendStopMessage: false });
    this._graphicWebviewPanel?.dispose();
    this.buildCurrentDocument();
    return !!(this._currentDocument && this._currentDocument.ir);
  }

  private async createAndConfigureGraphicPanel(): Promise<WebviewPanel> {
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
    panel.onDidDispose(() => {
      this._graphicWebviewPanel = undefined;
      if (this._isSimulating) this._simulator?.makeEditorWritable();
      this.cleanupSimulator({ sendStopMessage: true });
      this._hasWebviewInitialized = false;
    });
    panel.webview.html = await getHtmlForGraphicSimulator(
      panel.webview,
      this.extensionContext.extensionUri
    );
    activateMessageListenerForRegistersView(panel.webview, this);
    return panel;
  }

  private async initializeAndStartGraphicSimulator(panel: WebviewPanel) {
    if (!this._currentDocument?.ir) {
      this.buildCurrentDocument();
      if (!this._currentDocument?.ir) {
        window.showErrorMessage("Failed to build the document. Cannot start simulation.");
        return;
      }
    }
    const settings: SimulationParameters = { memorySize: 40 };
    this._simulator = new GraphicSimulator(
      this._simulatorType,
      settings,
      this._currentDocument,
      this,
      panel.webview
    );
    this._isSimulating = true;
    commands.executeCommand("setContext", "ext.isSimulating", true);
    await this._simulator.start();

    if (this._hasWebviewInitialized) {
      this._simulator.sendInitialData();
    }
    panel.reveal(panel.viewColumn);
  }

  private prepareForTextSimulation(): boolean {
    this._madeReadonlyOnce = false;
    const editor = window.activeTextEditor;
    if (!editor || !RVDocument.isValid(editor.document)) {
      window.showErrorMessage("No valid RISC-V document open");
      return false;
    }
    if (!this._textWebview) {
      commands.executeCommand("rv-simulator.riscv.focus");
      window.showWarningMessage(
        "Text simulator view is now open. Please press 'Text Simulate' again."
      );
      return false;
    }
    this._graphicWebviewPanel?.dispose();
    this.cleanupSimulator({ sendStopMessage: true });
    commands.executeCommand("rv-simulator.riscv.focus");
    this.buildCurrentDocument();
    return !!(this._currentDocument && this._currentDocument.ir);
  }

  private initializeAndStartTextSimulator() {
    if (!this._currentDocument?.ir || !this._textWebview) return;
    const settings: SimulationParameters = { memorySize: 40 };
    this._simulator = new TextSimulator(
      this._simulatorType,
      settings,
      this._currentDocument,
      this,
      this._textWebview
    );
    this._isSimulating = true;
    commands.executeCommand("setContext", "ext.isSimulating", true);
    this._simulator.start();
    this._simulator.sendInitialData();
  }

  // =================================================================
  //  5. Simulation Control
  // =================================================================

  private step() {
    this._simulator?.step();
  }

  private stop() {
    this.cleanupSimulator({ sendStopMessage: true });
  }

  private async resetSimulator() {
    if (!this._simulator || !this._currentDocument) return;
    const wasGraphic = this._simulator instanceof GraphicSimulator;
    const wasText = this._simulator instanceof TextSimulator;

    this.cleanupSimulator({ sendStopMessage: false });

    if (wasGraphic && this._graphicWebviewPanel) {
      await this.initializeAndStartGraphicSimulator(this._graphicWebviewPanel);
    } else if (wasText) {
      this.buildCurrentDocument();
      this.initializeAndStartTextSimulator();
    }
  }

  // =================================================================
  //  6. Event Dispatching
  // =================================================================

  public async dispatchMainViewEvent(message: any) {
    if (message.event === "webviewReady") {
      this._simulator?.sendInitialData();
      this._hasWebviewInitialized = true;
      return;
    }
    if (message.event === "clickOpenRISCVCard") {
      RiscCardPanel.riscCard(this.extensionContext.extensionUri);
      return;
    }

    switch (message.event) {
      case "pipeline":
        if (this._simulatorType === "monocycle") {
          this._simulatorType = "pipeline";
          await this.resetSimulator();
        }
        break;
      case "reset":
        await this.resetSimulator();
        break;
      case "stop":
        this.stop();
        break;
      case "step":
        if (!this._simulator) {
          await this.resetSimulator();
        }
        this.step();
        break;
      case "monocycle":
      case "clickInInstruction":
      case "memorySizeChanged":
      case "registersChanged":
      case "memoryChanged":
        if (!this._simulator) return;
        this.handleSimulatorEvents(message);
        break;
      default:
        break;
    }
  }

  private handleSimulatorEvents(message: any) {
    switch (message.event) {
      case "monocycle":
        if (this._simulatorType === "pipeline") {
          this._simulatorType = "monocycle";
          this.resetSimulator();
        }
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
    }
  }

  private buildCurrentDocument() {
    const editor = window.activeTextEditor;
    if (editor?.document.languageId === "riscvasm") {
      if (!this._encoderDecorator) this._encoderDecorator = new EncoderDecorator();
      this._currentDocument = new RVDocument(editor, this);
      this._currentDocument.buildAndDecorate(this);
    }
  }

  private cleanupSimulator(options?: { sendStopMessage: boolean }) {
    if (!this._simulator) return;
    commands.executeCommand("setContext", "ext.isSimulating", false);
    const simulatorToStop = this._simulator;
    simulatorToStop.stop(options);
    this.clearDecorations();
  }

  public clearDecorations() {
    this._isSimulating = false;
    this._simulator = undefined;
    if (this._encoderDecorator && window.activeTextEditor) {
      this._encoderDecorator.clearDecorations(window.activeTextEditor);
    }
    this._encoderDecorator = undefined;
  }

  private animateLine(line: number) {
    this._simulator?.animateLine(line);
  }
  private memorySizeChanged(newSize: number) {
    this._simulator?.resizeMemory(newSize);
  }
  private registersChanged(newRegisters: string[]) {
    this._simulator?.replaceRegisters(newRegisters);
  }
  private memoryChanged(newMemory: []) {
    this._simulator?.replaceMemory(newMemory);
  }
  public resetEncoderDecorator(editor: TextEditor): void {
    this._encoderDecorator?.clearDecorations(editor);
    this._encoderDecorator = undefined;
  }
}
