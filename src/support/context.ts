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
  private _mainPanel: WebviewPanel | undefined;
  private _encoderDecorator: EncoderDecorator | undefined;
  private _mainWebviewView: Webview | undefined;
  private _mainViewIsFirstTimeVisible = true;
  private _currentDocument: RVDocument | undefined;
  private _isSimulating = false;
  private _simulator: Simulator | undefined;

  get configurationManager(): ConfigurationManager {
    return this._configurationManager;
  }

  get encoderDecorator(): EncoderDecorator | undefined {
    return this._encoderDecorator;
  }

  get mainWebviewView(): Webview {
    return this._mainWebviewView as Webview;
  }

  get simulator(): Simulator {
    if (!this._simulator) throw new Error("Simulator not initialized.");
    return this._simulator;
  }

  static create(context: ExtensionContext): RVContext {
    if (!RVContext.#instance) {
      RVContext.#instance = new RVContext(context);
    } else {
      throw new Error("RV extension context is already created");
    }
    return RVContext.#instance;
  }

  private constructor(context: ExtensionContext) {
    this.extensionContext = context;
    this.disposables = [];
    this._configurationManager = new ConfigurationManager();

    this.registerMainWebview();
    this.registerCommands();
    this.setupEditorListeners();

    commands.executeCommand("setContext", "ext.isSimulating", false);
  }

  private registerMainWebview() {
    this.disposables.push(
      window.registerWebviewViewProvider(
        "rv-simulator.riscv",
        {
          resolveWebviewView: async (webviewView) => {
            webviewView.webview.options = {
              enableScripts: true,
              localResourceRoots: [this.extensionContext.extensionUri],
            };
            webviewView.title = "Registers and memory view";
            webviewView.webview.html = await getHtmlForTextSimulator(
              webviewView.webview,
              this.extensionContext.extensionUri
            );
            await activateMessageListenerForRegistersView(webviewView.webview, this);

            this._mainWebviewView = webviewView.webview;

            if (webviewView.visible) this.onMainViewVisible();
            webviewView.onDidChangeVisibility(() => {
              if (webviewView.visible) {
                this._mainWebviewView = webviewView.webview;
                this.onMainViewVisible();
              }
            });
          },
        },
        {
          webviewOptions: { retainContextWhenHidden: true },
        }
      )
    );
  }

  private registerCommands() {
    this.disposables.push(
      commands.registerCommand("rv-simulator.simulate", async () => {
        const editor = window.activeTextEditor;
        if (!editor || !RVDocument.isValid(editor.document)) {
          return window.showErrorMessage("No valid RISC-V document open");
        }

        this._encoderDecorator = new EncoderDecorator();
        this.buildCurrentDocument();
        if (!this._currentDocument || !this._currentDocument.ir) return;

        if (this._mainPanel) this._mainPanel.dispose();

        const panel = window.createWebviewPanel("riscCard", "RISC-V", ViewColumn.One, {
          enableScripts: true,
          retainContextWhenHidden: true,
          localResourceRoots: [
            Uri.joinPath(this.extensionContext.extensionUri, "node_modules"),
            Uri.joinPath(this.extensionContext.extensionUri, "src/templates"),
            Uri.joinPath(this.extensionContext.extensionUri, "out"),
          ],
        });

        this._mainPanel = panel;
        panel.onDidDispose(() => {
          this._mainPanel = undefined;
          this.cleanupAfterSimulation();
        });

        panel.webview.html = await getHtmlForGraphicSimulator(
          panel.webview,
          this.extensionContext.extensionUri
        );
        await activateMessageListenerForRegistersView(panel.webview, this);
        this._mainWebviewView = panel.webview;

        this.simulateProgram(this._currentDocument, true);
      }),

      commands.registerCommand("rv-simulator.textSimulate", () => {
        const editor = window.activeTextEditor;
        if (!editor || !RVDocument.isValid(editor.document)) {
          return window.showErrorMessage("No valid RISC-V document open");
        }

        commands.executeCommand("rv-simulator.riscv.focus");
        this._encoderDecorator = new EncoderDecorator();
        this.buildCurrentDocument();
        if (this._currentDocument) {
          this.simulateProgram(this._currentDocument, false);
        }
      }),

      commands.registerCommand("rv-simulator.simulateStep", () => {
        try {
          this._simulator?.step();
        } catch {
          this._simulator?.stop();
        }
      }),

      commands.registerCommand("rv-simulator.simulateStop", () => {
        this._simulator?.stop();
        this._isSimulating = false;
        this._simulator = undefined;
      }),

      commands.registerCommand("rv-simulator.build", () => {
        if (!this._encoderDecorator) {
          this._encoderDecorator = new EncoderDecorator();
        }
        this.buildCurrentDocument();
      })
    );
  }

  private setupEditorListeners() {
    this.disposables.push(
      window.onDidChangeActiveTextEditor(() => {
        this.buildCurrentDocument();
      })
    );

    this.extensionContext.subscriptions.push({
      dispose: () => this.disposables.reverse().forEach((d) => d.dispose()),
    });
  }

  private onMainViewVisible() {
    if (this._mainViewIsFirstTimeVisible) {
      if (this._isSimulating) this._simulator?.start();
      this._mainViewIsFirstTimeVisible = false;
    }
  }

  private buildCurrentDocument() {
    const editor = window.activeTextEditor;
    if (editor?.document.languageId === "riscvasm") {
      this._currentDocument = new RVDocument(editor, this);
      this._currentDocument.buildAndDecorate(this);
    }
  }

  private simulateProgram(rvDoc: RVDocument, isGraphic: boolean) {
    if (!rvDoc.ir) return;

    const settings: SimulationParameters = { memorySize: 40 };
    this._simulator = isGraphic
      ? new GraphicSimulator(settings, rvDoc, this)
      : new TextSimulator(settings, rvDoc, this);

    this._isSimulating = true;
    commands.executeCommand("setContext", "ext.isSimulating", true);

    if (isGraphic) {
      commands.executeCommand("workbench.action.closePanel");
    }

    this._simulator.start();

    if (!isGraphic && this._encoderDecorator) {
      this._currentDocument?.buildAndDecorate(this);
    }
  }

  private cleanupAfterSimulation() {
    this._simulator?.stop();
    this._simulator = undefined;
    this._isSimulating = false;
    this._encoderDecorator = undefined;

    commands.executeCommand("rv-simulator.riscv.focus");

    commands.executeCommand("setContext", "ext.isSimulating", false);
  }

  private step() {
    if (!this._simulator) throw new Error("No simulator is running");
    try {
      this._simulator.step();
    } catch {
      this._simulator.stop();
    }
  }

  private stop() {
    if (!this._simulator) throw new Error("No simulator is running");
    this._simulator.stop();
    this._isSimulating = false;
    this._simulator = undefined;
  }

  private animateLine(line: number) {
    this.simulator.animateLine(line);
  }

  private memorySizeChanged(newSize: number) {
    this.simulator.resizeMemory(newSize);
  }

  private registersChanged(newRegisters: string[]) {
    this.simulator.replaceRegisters(newRegisters);
  }

  private memoryChanged(newMemory: []) {
    this.simulator.replaceMemory(newMemory);
  }

  public resetEncoderDecorator(editor: TextEditor): void {
    this._encoderDecorator?.clearDecorations(editor);
    this._encoderDecorator = undefined;
  }

  public dispatchMainViewEvent(message: any) {
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
      case "clickOpenRISCVCard":
        RiscCardPanel.riscCard(this.extensionContext.extensionUri);
        break;
      default:
        console.log("[Mainview - unknown event]", message);
        break;
    }
  }
}
