/* eslint-disable @typescript-eslint/naming-convention */

import { commands, Disposable, ExtensionContext, Webview, window, TextEditor, ViewColumn, Uri , WebviewPanel  } from "vscode";
import {
  activateMessageListenerForRegistersView,
} from "../tabs/MainTab";

import { getHtmlForGraphicSimulator } from "../simulators/graphicSimulator/provider";
import { getHtmlForTextSimulator } from "../simulators/textSimulator/provider";
import { RiscCardPanel } from "../simulators/instructionSet/provider";

import { RVDocument } from "../rvDocument";
import { EncoderDecorator } from "../encoderDecorator";
import { ConfigurationManager } from "./configurationManager";
import { SimulationParameters, Simulator, BasicSimulator, TextSimulator, BasicTextSimulator } from "../Simulator";
import { intToBinary } from "../utilities/conversions";


export class RVContext {
  // For the singleton pattern
  static #instance: RVContext | null;
  // vscode context
  private extensionContext: ExtensionContext;
  // Disposable objects
  private disposables: Disposable[];
  // Configuration manager
  private _configurationManager: ConfigurationManager;
  get configurationManager(): ConfigurationManager {
    return this._configurationManager;
  }
  private _mainPanel: WebviewPanel | undefined;

  // Reference to the decorator
  private _encoderDecorator: EncoderDecorator | undefined;
  get encoderDecorator(): EncoderDecorator  | undefined {
    if (!this._encoderDecorator) {
      return undefined;
    }
    return this._encoderDecorator;
  }
  private _mainWebviewView: Webview | undefined;
  get mainWebviewView(): Webview {
    return this._mainWebviewView as Webview;
  }
  private _mainViewIsFirstTimeVisible = true;
  // TODO: unused for now
  private _currentDocument: RVDocument | undefined;

  // Simulation attributes
  private _isSimulating: boolean;
  private _simulator: Simulator | BasicSimulator | undefined;
  // private _basicSimulator: BasicSimulator | undefined;
  get simulator(): Simulator | BasicSimulator {
    if (!this._simulator) {
      throw new Error("Error in the program to be simulated.");
    }
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
    // Place to store all the disposables elements created by the extension.
    this.disposables = [];
    // vscode extension context
    this.extensionContext = context;
    // Configuration manager
    this._configurationManager = new ConfigurationManager();
    this._encoderDecorator = undefined;

    this._currentDocument = undefined;
    this._isSimulating = false;
    this._simulator = undefined;

    /**
     * Main webview initialization
     */

    this.disposables.push(
      window.registerWebviewViewProvider(
        "rv-simulator.riscv",
        {
          resolveWebviewView: async (webviewView, context, token) => {
            console.log("Creating main webview");
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
            if (webviewView.visible) {
              this.onMainViewVisible();
            }

            webviewView.onDidChangeVisibility(() => {
              if (webviewView.visible) {
                // The webview is now visible
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


    this.disposables.push(

      commands.registerCommand('rv-simulator.simulate', async () => {

        const editor = window.activeTextEditor;
        if (editor && RVDocument.isValid(editor.document)) {
          this._encoderDecorator = new EncoderDecorator();
          this.buildCurrentDocument();
          if (!this._currentDocument) {
            throw new Error("There is no valid program to simulate");
          }
        } else {
          window.showErrorMessage("There is no a valid RiscV document open");
          return;
        }

        // If the document is not valid (parser error), return
        if(this._currentDocument.ir === undefined){
          return;
        }

        // Clear the previous context and cache
        if (this._mainPanel) {
          this._mainPanel.dispose();
        }


        // Create the webview panel
        const panel = window.createWebviewPanel(
          'riscCard',
          'RISC-V',
          ViewColumn.One,
          {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [
              Uri.joinPath(this.extensionContext.extensionUri, "node_modules"),
              Uri.joinPath(this.extensionContext.extensionUri, "src/templates"),
              Uri.joinPath(this.extensionContext.extensionUri, "out")
            ]
          }
        );

        this._mainPanel = panel;

        //Listen for the window to close
        panel.onDidDispose(() => {
          this._mainPanel = undefined; 
          commands.executeCommand("setContext", "ext.isSimulating", false);
          this._simulator?.stop();
          this._encoderDecorator = undefined;


      });
    
        panel.webview.html = await getHtmlForGraphicSimulator(panel.webview, this.extensionContext.extensionUri);
    
        // Message listener
        await activateMessageListenerForRegistersView(panel.webview, this);
        this._mainWebviewView = panel.webview;
        this.simulateProgram(this._currentDocument);
        this.sendTextProgramToView(); //Send the text program to the view
    
        
      })
    );

    // Text Simulator
    this.disposables.push(
      commands.registerCommand("rv-simulator.textSimulate", () => {
        const editor = window.activeTextEditor;
        commands.executeCommand(`rv-simulator.riscv.focus`);
        if (editor && RVDocument.isValid(editor.document)) {
          // We have an editor with a valid RiscV document open
          this._encoderDecorator = new EncoderDecorator();
          this.buildCurrentDocument();
          if (!this._currentDocument) {
            throw new Error("There is no valid program to simulate");
          }

          this.textSimulateProgram(this._currentDocument);
        } else {
          // In case the command is invoked via the command palette
          window.showErrorMessage("There is no a valid RiscV document open");
        }
      })
    );
    

    //  Simulate-step
    this.disposables.push(
      commands.registerCommand("rv-simulator.simulateStep", () => {
        if (!this._simulator) {
          throw new Error("No simulator is running");
        }
        // If not found other instructions, stop
        try{
          this._simulator.step();
        }catch{
          this._simulator.stop();
        }
       
      })
    );
    //  Simulate-stop
    this.disposables.push(
      commands.registerCommand("rv-simulator.simulateStop", () => {
        if (!this._simulator) {
          throw new Error("No simulator is running");
        } else {
          this._simulator.stop();
          this._isSimulating = false;
          this._simulator = undefined;
          const editor = window.activeTextEditor;
        }
      })
    );

    //  Build
    this.disposables.push(
      commands.registerCommand("rv-simulator.build", () => {
        if (!this._encoderDecorator) {
          this._encoderDecorator = new EncoderDecorator();
        }
        this.buildCurrentDocument();
      })
    );

    /**
     * When the active text editor changes, build the new current document if
     * applicable.
     * TODO: not sure if editor and activeTextEditor are the same thing.
     * This is because buildCurrentDocument() uses the active text editor.
     */
    this.disposables.push(
      window.onDidChangeActiveTextEditor((editor) => {
        if (editor) {
          this.buildCurrentDocument();
        }
      })
    );

    console.log("Registering subscriptions");
    this.extensionContext.subscriptions.push({
      dispose: () => {
        this.disposables.reverse().forEach((d) => {
          d.dispose();
        });
      },
    });

    // This tells vscode that the extension is not simulating and in turn some
    // commands get disabled.
    commands.executeCommand("setContext", "ext.isSimulating", false);

    console.log("Context constructor done");
  }

  private onMainViewVisible() {
    if (this._mainViewIsFirstTimeVisible) {
      console.log("Main view is visible for the first time", this.mainWebviewView);
      if (this._isSimulating) {
        this._simulator?.start();
      }
      this._mainViewIsFirstTimeVisible = false;
    } else {
      console.log("Main view is visible again");
    }
  }

  private buildCurrentDocument() {
    const editor = window.activeTextEditor;
    if (editor) {
      const document = editor.document;
      if (document.languageId === "riscvasm" ) {
        this._currentDocument = new RVDocument(editor, this);
        this._currentDocument.buildAndDecorate(this);
      }
    }
  }

  private simulateProgram(rvDoc: RVDocument) {
    console.log("Simulating program");
    if (!rvDoc.ir) {
      return;
    }
    const settings: SimulationParameters = {
      memorySize: 40,
    };
    // From now on the editor must be read only
    const simulator: Simulator = new TextSimulator(settings, rvDoc, this);

    // This tells vscode that the extension is simulating and in turn some
    // commands get enabled.
    this._isSimulating = true;
    commands.executeCommand("setContext", "ext.isSimulating", true);
    commands.executeCommand('workbench.action.closePanel');
    this._simulator = simulator;
    simulator.start();
  }

  private textSimulateProgram(rvDoc: RVDocument) {
    console.log("Simulating program");
    if (!rvDoc.ir) {
      return;
    }
    const settings: SimulationParameters = {
      memorySize: 40,
    };
    // From now on the editor must be read only
    const simulator: BasicSimulator = new BasicTextSimulator(settings, rvDoc, this);

    // This tells vscode that the extension is simulating and in turn some
    // commands get enabled.
    this._isSimulating = true;
    commands.executeCommand("setContext", "ext.isSimulating", true);
    this._simulator = simulator;
    simulator.start();
  }

  // This method is in charge of sending the text program to the view when start the  simulation
  private sendTextProgramToView(){
    if (!this._currentDocument) {
      throw new Error("No current document");
    }
    this.simulator.sendTextProgramToView(this._currentDocument.getText());
  }

  private step(){
    if (!this._simulator) {
      throw new Error("No simulator is running");
    }
    try{
      this._simulator.step();
    }catch{
      this._simulator.stop();
    }
  }

  private stop() {
    if (!this._simulator) {
      throw new Error("No simulator is running");
    }
    this._simulator.stop();
    this._isSimulating = false;
    this._simulator = undefined;
    const editor = window.activeTextEditor;
  }

  private animateLine(line: number) {
      this.simulator.animateLine(line);
  }

  private memorySizeChanged(newSize: number) {
    this.simulator.resizeMemory(newSize);
    if (this.simulator instanceof BasicTextSimulator){
      this.mainWebviewView.postMessage({
        operation: "setRegister",
        register: "x2",
        value: intToBinary(newSize),
      });
    }
  }

  private registersChanged(newRegisters: string[]) {
    this.simulator.replaceRegisters(newRegisters);
  }

  private memoryChanged(newMemory: []) {
    this.simulator.replaceMemory(newMemory);
  }

  

  public resetEncoderDecorator(editor: TextEditor): void {
    if (this._encoderDecorator) {
      this._encoderDecorator.clearDecorations(editor);
      this._encoderDecorator = undefined;
    }
  }

  /**
   * This method is in charge of dispatching events sent by the main view.
   */
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
      case 'registersChanged':
        this.registersChanged(message.value);
        break;
      case "memoryChanged":
        this.memoryChanged(message.value);
        break;
      case "clickOpenRISCVCard":
        RiscCardPanel.riscCard(this.extensionContext.extensionUri);
        break;
      default:
        console.log(`%c[Mainview-unknown event received at context}]\n`, "color:green", message);
        break;
    }
  }

  
}


