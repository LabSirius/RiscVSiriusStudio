/* eslint-disable @typescript-eslint/naming-convention */

import { TextDocument, TextEditor, window } from 'vscode';
import { SCCPU, SCCPUResult } from '../vcpu/singlecycle';
import { SimulatorPanel } from '../panels/SimulatorPanel';
import { RegisterPanelView } from '../panels/RegisterPanel';
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

export class RVExtensionContext {
  /**
   * Regerence to the document with the source code.
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

  public constructor() {
    this.programMemoryMap = new Map<number, number>();
    this.sourceCodeMap = new Map<number, number>();

    this.currentFile = '';
    this.memorySize = 128;
    this.stackPointerInitialAddress = 124;
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
        body: `Cannot write ${
          result.dm.dataWr
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
