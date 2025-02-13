/* eslint-disable @typescript-eslint/naming-convention */

import { commands, Disposable, ExtensionContext, StatusBarItem, TextDocument, TextEditor, Webview, WebviewView, window, workspace } from 'vscode';
import { SCCPU, SCCPUResult } from '../vcpu/singlecycle';
import { SimulatorPanel } from '../panels/SimulatorPanel';
import { activateMessageListenerForRegistersView, getHtmlForRegistersWebview, RegisterPanelView } from '../panels/RegisterPanel';
import { LineTracker } from '../lineTracker';
import { DocumentTracker } from '../docummentTracker';
import {
  branchesOrJumps,
  getFunct3,
  readsDM,
  usesRegister,
  writesDM,
  writesRU
} from '../utilities/instructions';
import { compile } from '../utilities/riscvc';
import { DataMemPanelView } from '../panels/DataMemPanel';
import { RiscCardPanel } from '../panels/RiscCardPanel';
import { RVDocument } from '../rvDocument';
import { EncoderDecorator } from '../encoderDecorator';
import { ConfigurationManager } from './configurationManager';
import { BasicSimulator } from '../basicSimulator';
import { Simulator } from '../Simulator';


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
  // Reference to the line tracker
  private _lineTracker: LineTracker;
  get lineTracker(): LineTracker {
    return this._lineTracker;
  }
  // Reference to the decorator
  private _encoderDecorator: EncoderDecorator;
  get encoderDecorator(): EncoderDecorator {
    return this._encoderDecorator;
  }
  private _mainWebviewView: Webview | undefined;
  get mainWebviewView(): Webview | undefined {
    return this._mainWebviewView;
  }

  // Reference to the status bar
  private _statusBarItem: StatusBarItem;
  get statusBarItem(): StatusBarItem {
    return this._statusBarItem;
  }

  // TODO: unused for now
  private _documents: RVDocument[];

  // Simulation attributes
  private _isSimulating: boolean;
  private _simulator: Simulator | undefined;

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

    this._lineTracker = new LineTracker();
    // this._documentTracker = new DocumentTracker();


    this._statusBarItem = window.createStatusBarItem('RVSiriusStudioBarItem', 1);
    this._statusBarItem.text = 'RiscVSiriusStudio';
    this._statusBarItem.show();

    this._documents = [];
    this._encoderDecorator = new EncoderDecorator();

    this._isSimulating = false;
    this._simulator = undefined;

    // Webviews
    this.disposables.push(
      window.registerWebviewViewProvider(
        'rv-simulator.riscv',
        {
          resolveWebviewView: async (webviewView, context, token) => {
            webviewView.webview.options = {
              enableScripts: true,
              localResourceRoots: [this.extensionContext.extensionUri],
              // Other possibilities:
              // enableCommandsUris
            };

            webviewView.title = "Registers and memory view";
            webviewView.webview.html = await getHtmlForRegistersWebview(webviewView.webview, this.extensionContext.extensionUri);
            await activateMessageListenerForRegistersView(webviewView.webview);
            this._mainWebviewView = webviewView.webview;
          },
        },
        {
          webviewOptions: { retainContextWhenHidden: true }
        }
      )
    );

    // Commands
    //  Simulator (start)
    this.disposables.push(
      commands.registerCommand('rv-simulator.simulate', () => {
        const editor = window.activeTextEditor;
        if (editor && RVDocument.isValid(editor.document)) {
          const rvDoc = this.getOrAddDocument(editor);
          rvDoc.buildAndDecorate(this);
          this.simulateProgram(rvDoc);
        }
      })
    );
    //  Simulate-step
    this.disposables.push(
      commands.registerCommand('rv-simulator.simulateStep', () => {
        if (!this._simulator) {
          throw new Error("No simulator is running");
        } else {
          this._simulator.step();
        }
      })
    );
    //  Simulate-stop
    this.disposables.push(
      commands.registerCommand('rv-simulator.simulateStop', () => {
        if (!this._simulator) {
          throw new Error("No simulator is running");
        } else {
          this._simulator.stop();
          this._isSimulating = false;
          this._simulator = undefined;
        }
      })
    );

    //  Build
    this.disposables.push(
      commands.registerCommand('rv-simulator.build', () => {
        console.log("New build implementation");
        const editor = window.activeTextEditor;
        if (editor) {
          const rvDoc = this.getOrAddDocument(editor);
          rvDoc.buildAndDecorate(this);
        }
      })
    );

    this.disposables.push(
      commands.registerCommand('rv-simulator.progMemExportJSON', () => {
        console.log("This should call progmem export to json");
        // exportProgMemJSON(context.extensionUri, rvContext);
      })
    );

    this.disposables.push(
      commands.registerCommand('rv-simulator.irExportJSON', () => {
        // exportIRJSON(context.extensionUri, rvContext);
      })
    );

    this.disposables.push(
      commands.registerCommand('rv-simulator.irForCurrentLine', () => {
        console.log("This should call ir for current line");
        // irForCurrentLine(rvContext);
      })
    );

    this.disposables.push(
      commands.registerCommand('rv-simulator.ShowCard', () => {
        RiscCardPanel.riscCard(context.extensionUri);
      })
    );


    // this.disposables.push(
    //   this.documentTracker.onActiveDocumentChanged(({ document, type }) => {
    //     console.log(`Switched to document: ${document.uri}`);
    //   })
    // );


    /**
     * When the active text editor changes, build the new current document if
     * applicable.
     * TODO: not sure if editor and activeTextEditor are the same thing.
     * This is because buildCurrentDocument() uses the active text editor.
     */
    this.disposables.push(
      window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
          this.buildCurrentDocument();
        }
      }));

    /**
     * Build the current document if applicable.
     * TODO: Can i make this asynchroonous?
     */
    this.buildCurrentDocument();

    console.log("Registering subscriptions");
    this.extensionContext.subscriptions.push(
      {
        dispose: () => {
          this.disposables.reverse().forEach(d => {
            d.dispose();
          });
        }
      }
    );

    // This tells vscode that the extension is not simulating and in turn some
    // commands get disabled.
    commands.executeCommand('setContext', 'ext.isSimulating', false);

    console.log("Context constructor done");
  }

  private buildCurrentDocument() {
    const editor = window.activeTextEditor;
    if (editor) {
      const document = editor.document;
      if (document.languageId === 'riscvasm') {
        const rvDoc = new RVDocument(document, this);
        rvDoc.buildAndDecorate(this);
      }
    }
  }

  /**
   * Returns the RVDocument associated to a text editor.
   */
  private getRVDocument(document: TextDocument): RVDocument | undefined {
    const rvDoc = this._documents.find(d => d.document.uri.toString() === document.uri.toString());
    if (rvDoc) {
      return rvDoc;
    }
    return undefined;
  }

  private getOrAddDocument(editor: TextEditor): RVDocument {
    const rvDoc = this.getRVDocument(editor.document);
    if (rvDoc) {
      return rvDoc;
    }
    const newDoc = new RVDocument(editor.document, this);
    this._documents.push(newDoc);
    this.encoderDecorator.decorate(editor, newDoc);
    return newDoc;
  }

  private simulateProgram(rvDoc: RVDocument) {
    console.log("Simulating program");
    // TODO: Select the cpu parameters
    if (!rvDoc.ir) {
      throw new Error("No valid IR found");
    }
    const program: any[] = rvDoc.ir?.instructions;
    const memSize: number = 128;
    const spAddress: number = memSize - 4;

    const simulator: Simulator = new Simulator(program, memSize, spAddress, rvDoc, this);

    // This tells vscode that the extension is simulating and in turn some
    // commands get enabled.
    commands.executeCommand('setContext', 'riscv.isSimulating', true);
    this._isSimulating = true;
    this._simulator = simulator;
    simulator.start();
  }
}



export class RVExtensionContext {
  // For the singleton pattern
  static #instance: RVExtensionContext | null;
  // vscode context
  private extensionContext: ExtensionContext;
  // Disposable objects
  private disposables: Disposable[];
  // Reference to the line tracker
  private _lineTracker: LineTracker;
  // Reference to the document tracker
  private _documentTracker: DocumentTracker;

  /**
   * Reference to the document with the source code.
   */
  private sourceDocument: TextDocument | undefined;
  /**
   * Reference to the document with the encoding of the program memory.
   */
  private programMemoryDocument: TextDocument | undefined;

  /**
   * Associates lines in the program memory document with their respective instruction indexes.
   */
  private programMemoryMap: Map<number, number>;
  private sourceCodeMap: Map<number, number>;

  private currentFile: string | undefined;
  private currentIR: any | undefined;
  private simulator: RVSimulationContext | undefined;
  private memorySize: number;
  private stackPointerInitialAddress: number;

  static create(context: ExtensionContext): RVExtensionContext {
    if (!RVExtensionContext.#instance) {
      RVExtensionContext.#instance = new RVExtensionContext(context);
    } else {
      throw new Error("RV extension context is already created");
    }
    return RVExtensionContext.#instance;
  }

  private constructor(context: ExtensionContext) {
    // Place to store all the disposables elements created by the extension.
    this.disposables = [];

    this.extensionContext = context;
    this._lineTracker = new LineTracker();
    this._documentTracker = new DocumentTracker();

    this.disposables.push(
      window.registerWebviewViewProvider(
        'rv-simulator.registers',
        {
          resolveWebviewView: async (webviewView, context, token) => {
            webviewView.webview.options = {
              enableScripts: true,
              localResourceRoots: [this.extensionContext.extensionUri],
              // Other possibilities:
              // enableCommandsUris
            };

            webviewView.title = "Registers and memory view";
            webviewView.webview.html = await getHtmlForRegistersWebview(webviewView.webview, this.extensionContext.extensionUri);
            await activateMessageListenerForRegistersView(webviewView.webview);
          },
        },
        {
          webviewOptions: { retainContextWhenHidden: true }
        }
      )
    );

    this.disposables.push(
      this.documentTracker.onActiveDocumentChanged(({ document, type }) => {
        console.log(`Switched to document: ${document.uri}`);
      })
    );

    this.extensionContext.subscriptions.push(
      {
        dispose: () => {
          this.disposables.reverse().forEach(d => {
            console.log("Disposing ", d);
            d.dispose();
          });
        }
      }
    );

    this.programMemoryMap = new Map<number, number>();
    this.sourceCodeMap = new Map<number, number>();

    this.currentFile = '';
    this.memorySize = 128;
    this.stackPointerInitialAddress = 124;
  }

  get lineTracker() {
    return this._lineTracker;
  }

  get documentTracker() {
    return this._documentTracker;
  }

  public setMemorySize(newSize: number) {
    this.memorySize = newSize;
    console.log('New memory size--------', newSize);
  }

  public setSpAddress(address: number) {
    if (address > this.memorySize) {
      throw new Error(
        'Stack pointer address needs to be lower than memory size'
      );
    }
    this.stackPointerInitialAddress = address;
  }

  public getCurrentFile() {
    return this.currentFile;
  }

  public build(fileName: string, sourceCode: string) {
    const result = compile(sourceCode, fileName);
    if (result.success) {
      this.currentIR = result.ir;
    } else {
      this.currentIR = undefined;
    }
  }

  public validIR(): boolean {
    return this.currentIR !== undefined;
  }

  public setSourceDocument(document: TextDocument) {
    this.sourceDocument = document;
    this.build(document.fileName, document.getText());
  }
  public setProgramMemoryForSourceCodeLine(
    sourceLine: number,
    memLine: number
  ) {
    this.sourceCodeMap.set(sourceLine, memLine);
  }

  public clearFileAssociations() {
    this.programMemoryMap.clear();
    this.sourceCodeMap.clear();
  }

  public setProgramMemoryDocument(document: TextDocument) {
    if (!this.validIR()) {
      throw new Error(
        'Setting program memory document for invalid representation'
      );
    }
    this.programMemoryDocument = document;
  }

  public getProgramMemoryDocument() {
    if (!this.validIR()) {
      throw new Error(
        'Getting program memory document for invalid representation'
      );
    }
    return this.programMemoryDocument;
  }

  public getProgramMemoryMap() {
    return this.programMemoryMap;
  }

  public getSourceCodeMap() {
    return this.sourceCodeMap;
  }

  // public setAndBuildCurrentFile(name: string, sourceCode: string) {
  //   this.currentFile = name;
  //   this.build(name, sourceCode);
  // }

  public getIR(): any {
    return this.currentIR;
  }

  public getIRForInstructionAt(line: number): any {
    if (this.currentIR === undefined) {
      throw Error('There is no intermediate representation of code yet.');
    }
    // handle difference between vscode line numbers and parser line numbers.
    const sourceLine = line + 1;

    const instruction = this.currentIR.instructions.find((e: any) => {
      const currentPos = e.location.start.line;
      return currentPos === sourceLine;
    });

    if (instruction) {
      return instruction;
    } else {
      // There are cases for which there is no instruction at a particular line.
      // For instance at code comments.
      return undefined;
    }
  }

  public startSimulation(
    simulator: SimulatorPanel,
    dataMemory: DataMemPanelView,
    registers: RegisterPanelView,
    settings: any = {}
  ) {
    console.log('start simulation at rvContext');
    // After this call the simulator instance will intercept the messages of the
    // views and will respond to them
    this.simulator = new RVSimulationContext(
      this.currentIR.instructions,
      this.memorySize,
      this.stackPointerInitialAddress,
      simulator,
      dataMemory,
      registers,
      settings
    );
  }

  public exportJSON() {
    const program = this.currentIR.instructions
      .filter((sc: any) => {
        return sc.kind === 'SrcInstruction';
      })
      .map((instruction: any) => {
        return {
          asm: instruction.asm,
          encoding: {
            binary: instruction.encoding.binEncoding,
            hex: instruction.encoding.hexEncoding
          }
        };
      });
    return JSON.stringify(program);
  }

  public isCurrentFile(name: string) {
    return this.currentFile ? name === this.currentFile : false;
  }

  /**
   *
   * @param document Checks if the document is a valid riscv assembly file that
   * can be simulated.
   *
   * The only check performed is based on the language identifier which in turns
   * depend on the package.json file.
   */
  public static isValidFile(document?: TextDocument | undefined): boolean {
    return document ? document.languageId === 'riscvasm' : false;
  }

  public static isValidBinFile(document?: TextDocument | undefined): boolean {
    if (document) {
      return document.languageId === 'riscvbin';
    }
    return false;
  }
}

export class RVSimulationContext {
  private cpu: SCCPU;
  private simPanel: SimulatorPanel;
  private dataMemPanel: DataMemPanelView;
  private regPanel: RegisterPanelView;

  constructor(
    program: any[],
    memSize: number,
    spAddress: number,
    simulator: SimulatorPanel,
    datamem: DataMemPanelView,
    registers: RegisterPanelView,
    settings: any = {}
  ) {
    this.cpu = new SCCPU(program, memSize, spAddress);
    this.simPanel = simulator;
    this.dataMemPanel = datamem;
    this.regPanel = registers;

    this.dataMemPanel.getWebView().onDidReceiveMessage((message: any) => {
      this.dispatch(message);
    });
    this.simPanel.getWebView().onDidReceiveMessage((message: any) => {
      this.dispatch(message);
    });
    this.regPanel.getWebView().onDidReceiveMessage((message: any) => {
      this.dispatch(message);
    });

    // Ensure nothing is selected in the program memory and the registers views
    this.sendToDataMemory({ operation: 'showDataMemView' });
    this.sendToDataMemory({ operation: 'clearSelection' });
    this.sendToRegisters({ operation: 'clearSelection' });
    this.sendToRegisters({ operation: 'showRegistersView' });
    this.sendToRegisters({ operation: 'settingsChanged', settings: settings });
  }

  private sendToSimulator(message: any) {
    this.simPanel.postMessage(message);
  }

  private sendToRegisters(message: any) {
    this.regPanel.getWebView().postMessage(message);
  }

  private sendToDataMemory(message: any) {
    this.dataMemPanel.getWebView().postMessage(message);
  }

  private selectRegister(registerName: string) {
    const instruction = this.cpu.currentInstruction();
    if (usesRegister(registerName, instruction.type)) {
      this.sendToRegisters({
        operation: 'selectRegister',
        register: instruction[registerName].regeq
      });
    }
  }

  private clearRegisterSelection() {
    this.sendToRegisters({
      operation: 'clearSelection'
    });
  }

  /**
   * When a register value is updated in the register's view, a messaqge arrives
   * to the dispatcher and this method is called. Here we notify the simulator
   * about that change to proper respond.
   */
  private updateRegister(regName: string, value: string) {
    this.sendToSimulator({
      operation: 'updateRegister',
      name: regName,
      value: value
    });
    this.cpu.getRegisterFile().writeRegister(regName, value);
  }

  private bytesToReadOrWrite() {
    const instruction = this.cpu.currentInstruction();
    const funct3 = getFunct3(instruction);
    let bytes;
    switch (funct3) {
      case '000':
        bytes = 1;
        break;
      case '001':
        bytes = 2;
        break;
      case '010':
        bytes = 4;
        break;
      default:
        throw new Error('Cannot deduce bytes to write from funct3');
    }
    return bytes;
  }
  private writeResult(result: SCCPUResult) {
    const instruction = this.cpu.currentInstruction();
    let bytesToWrite = this.bytesToReadOrWrite();
    const addressNum = parseInt(result.dm.address, 2);
    if (!this.cpu.getDataMemory().canWrite(bytesToWrite, addressNum)) {
      this.sendToSimulator({
        operation: 'simulationFinished',
        title: 'Simulation error',
        body: `Cannot write ${result.dm.dataWr
          } (${bytesToWrite} bytes) to memory address ${addressNum.toString(
            16
          )} last address is ${this.cpu
            .getDataMemory()
            .lastAddress()
            .toString(16)} `
      });
    }
    // console.log(
    //   'Writing result to DM address: ',
    //   result.dm.address,
    //   ' value to write ',
    //   result.dm.dataWr,
    //   ' section to write ',
    //   bytesToWrite,
    //   ' can Write ',
    //   this.cpu.getDataMemory().canWrite(bytesToWrite, addressNum)
    // );
    this.sendToDataMemory({
      operation: 'write',
      address: result.dm.address,
      value: result.dm.dataWr,
      bytes: bytesToWrite
    });
    const chunks = result.dm.dataWr.match(/.{1,8}/g) as Array<string>;
    this.cpu.getDataMemory().write(chunks.reverse(), addressNum);
  }

  private dispatch(message: any) {
    console.log('RVSimulationContext dispatch', message);
    switch (message.command) {
      case 'event':
        {
          const { from: sender, message: msg } = message;
          console.log('Simulation event', sender, msg);
          switch (msg) {
            case 'stepClicked':
              {
                if (this.cpu.finished()) {
                  this.sendToSimulator({
                    operation: 'simulationFinished',
                    title: 'Simulation finished',
                    body: '..... Something ....'
                  });
                  return;
                }
                const instruction = this.cpu.currentInstruction();
                const result = this.cpu.executeInstruction();
                // Send messages to update the registers view.
                if (writesRU(instruction.type, instruction.opcode)) {
                  console.log('Writing result to RU ', result.wb.result);
                  this.sendToRegisters({
                    operation: 'setRegister',
                    register: instruction.rd.regeq,
                    value: result.wb.result
                  });
                  this.cpu
                    .getRegisterFile()
                    .writeRegister(instruction.rd.regeq, result.wb.result);
                }
                if (readsDM(instruction.type, instruction.opcode)) {
                  this.sendToDataMemory({
                    operation: 'read',
                    address: result.dm.address,
                    bytes: this.bytesToReadOrWrite()
                  });
                }
                if (writesDM(instruction.type, instruction.opcode)) {
                  this.writeResult(result);
                }
                // Send message to update the simulator components.
                this.sendToSimulator({
                  operation: 'setInstruction',
                  instruction: instruction,
                  result: result
                });

                if (branchesOrJumps(instruction.type, instruction.opcode)) {
                  this.cpu.jumpToInstruction(result.buMux.result);
                } else {
                  this.cpu.nextInstruction();
                }
              }
              break;
            case 'watchRegister':
              {
                console.log('Watch register ', message.register);
                this.sendToRegisters({
                  operation: 'watchRegister',
                  register: message.register
                });
              }
              break;
            case 'registerUpdate':
              /**
               * This message is received when the user updates the value of a
               * register in the register's view.
               */
              console.log('Register update event ', message);
              this.updateRegister(message.name, message.value);
              break;
            default:
              console.log('not understood', message);
              break;
          }
        }
        break;
      default:
        // console.log('Ignoring message in simulation', message);
        break;
    }
  }
}
