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

  // =================================================================
  //  1. Singleton and Constructor
  // =================================================================

  /**
   * Creates or returns the single instance of the RVContext.
   * @param context The extension context from VS Code.
   * @returns The singleton instance of RVContext.
   */
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

  /**
   * Registers all commands for the extension.
   */
  private registerCommands() {
    this.disposables.push(
      // --- Graphic Simulator Command ---
      commands.registerCommand("rv-simulator.simulate", async () => {
        const environmentReady = await this.prepareForGraphicSimulation();
        if (!environmentReady) return;

        const panel = await this.createAndConfigureGraphicPanel();
        await this.initializeAndStartGraphicSimulator(panel);
      }),

      // --- Text Simulator Command ---
      commands.registerCommand("rv-simulator.textSimulate", () => {
        const environmentReady = this.prepareForTextSimulation();
        if (!environmentReady) return;

        this.initializeAndStartTextSimulator();
      }),

      // --- Simulation Control Commands ---
      commands.registerCommand("rv-simulator.simulateStep", () => this.step()),
      commands.registerCommand("rv-simulator.simulateReset", () => this.resetSimulator()),
      commands.registerCommand("rv-simulator.simulateStop", () => {
        this.cleanupSimulator();
        this._graphicWebviewPanel?.dispose();
      }),
      commands.registerCommand("rv-simulator.build", () => this.buildCurrentDocument())
    );
  }

  /**
   * Registers the provider for the text-based simulator view (bottom panel).
   */
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
                this.cleanupSimulator();
              }
            });
          },
        },
        { webviewOptions: { retainContextWhenHidden: true } }
      )
    );
  }

  /**
   * Sets up listeners for editor-related events.
   */
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

  /**
   * Prepares the environment for a graphic simulation.
   * @returns `true` if the environment is ready, `false` otherwise.
   */
  private async prepareForGraphicSimulation(): Promise<boolean> {
    this._madeReadonlyOnce = false;
    const editor = window.activeTextEditor;
    if (!editor || !RVDocument.isValid(editor.document)) {
      window.showErrorMessage("No valid RISC-V document open");
      return false;
    }
    await commands.executeCommand("workbench.action.closePanel");
    this.cleanupSimulator();
    this._graphicWebviewPanel?.dispose();
    this.buildCurrentDocument();
    return !!(this._currentDocument && this._currentDocument.ir);
  }

  /**
   * Creates and configures the webview panel for the graphic simulator.
   * @returns The created `WebviewPanel`.
   */
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
      this.cleanupSimulator();
    });
    panel.webview.html = await getHtmlForGraphicSimulator(
      panel.webview,
      this.extensionContext.extensionUri
    );
    activateMessageListenerForRegistersView(panel.webview, this);
    return panel;
  }

  /**
   * Initializes and starts the graphic simulator instance.
   * @param panel The webview panel where the simulator will be displayed.
   */
  private async initializeAndStartGraphicSimulator(panel: WebviewPanel) {
    if (!this._currentDocument) return;
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
    panel.reveal(panel.viewColumn);
  }

  /**
   * Prepares the environment for a text simulation.
   * @returns `true` if the environment is ready, `false` otherwise.
   */
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
    this.cleanupSimulator();
    commands.executeCommand("rv-simulator.riscv.focus");
    this.buildCurrentDocument();
    return !!(this._currentDocument && this._currentDocument.ir);
  }

  /**
   * Initializes and starts the text simulator instance.
   */
  private initializeAndStartTextSimulator() {
    if (!this._currentDocument || !this._textWebview) return;
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
  }

  // =================================================================
  //  5. Simulation Control
  // =================================================================

  /** Handles a single simulation step. */
  private step() {
    this._simulator?.step();
  }

  /** Stops the current simulation. */
  private stop() {
    this.cleanupSimulator();
  }

  /**
   * Resets the simulation. This correctly handles UI focus by recreating the view.
   */
  private resetSimulator() {
    if (!this._simulator) return;
    const wasGraphic = this._simulator instanceof GraphicSimulator;
    const wasText = this._simulator instanceof TextSimulator;

    this.cleanupSimulator();

    if (wasGraphic) {
      this._graphicWebviewPanel?.dispose();
      setTimeout(() => commands.executeCommand("rv-simulator.simulate"), 100);
    } else if (wasText) {
      commands.executeCommand("rv-simulator.textSimulate");
    }
  }

  // =================================================================
  //  6. Event Dispatching
  // =================================================================

  /**
   * Handles all incoming messages from the webview UI.
   * @param message The message object from the webview.
   */
  public dispatchMainViewEvent(message: any) {
    if (message.event === "clickOpenRISCVCard") {
      RiscCardPanel.riscCard(this.extensionContext.extensionUri);
      return;
    }

    if (!this._simulator) return;

    switch (message.event) {
      case "monocycle":
        this._simulatorType = "monocycle";
        // Do nothing, as monocycle is the default initial state.
        break;
      case "pipeline":
        // Switch to pipeline mode by updating the type and resetting.
        if (this._simulatorType === "monocycle") {
          this._simulatorType = "pipeline";
          this.resetSimulator();
        }

        break;
      case "reset":
        this.resetSimulator();
        break;
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

  // =================================================================
  //  7. Internal State & Helpers
  // =================================================================

  /** Builds the Intermediate Representation from the current document. */
  private buildCurrentDocument() {
    const editor = window.activeTextEditor;
    if (editor?.document.languageId === "riscvasm") {
      if (!this._encoderDecorator) this._encoderDecorator = new EncoderDecorator();
      this._currentDocument = new RVDocument(editor, this);
      this._currentDocument.buildAndDecorate(this);
    }
  }

  /** Cleans up the current simulator instance and its decorations. */
  private cleanupSimulator() {
    if (!this._simulator) return;
    commands.executeCommand("setContext", "ext.isSimulating", false);
    const simulatorToStop = this._simulator;
    simulatorToStop.stop();
    this.clearDecorations();
  }

  /** Clears all decorations from the editor. */
  public clearDecorations() {
    this._isSimulating = false;
    this._simulator = undefined;
    if (this._encoderDecorator && window.activeTextEditor) {
      this._encoderDecorator.clearDecorations(window.activeTextEditor);
    }
    this._encoderDecorator = undefined;
  }

  /** Animates a specific line in the editor. */
  private animateLine(line: number) {
    this._simulator?.animateLine(line);
  }

  /** Resizes the data memory of the simulator. */
  private memorySizeChanged(newSize: number) {
    this._simulator?.resizeMemory(newSize);
  }

  /** Replaces the entire register file with new data. */
  private registersChanged(newRegisters: string[]) {
    this._simulator?.replaceRegisters(newRegisters);
  }

  /** Replaces the entire data memory with new data. */
  private memoryChanged(newMemory: []) {
    this._simulator?.replaceMemory(newMemory);
  }

  /** Resets the encoder decorator. */
  public resetEncoderDecorator(editor: TextEditor): void {
    this._encoderDecorator?.clearDecorations(editor);
    this._encoderDecorator = undefined;
  }
}
