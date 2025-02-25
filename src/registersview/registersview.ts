import {
  provideVSCodeDesignSystem,
  allComponents
} from '@vscode/webview-ui-toolkit';


import { RegistersTable } from './registersTable/registersTable';
import { MemoryTable } from './memoryTable';

import { setUpConvert } from './convertTool';
import { UIManager } from './uiManager';
import { InternalRepresentation } from '../utilities/riscvc';
provideVSCodeDesignSystem().register(allComponents);

const vscode = acquireVsCodeApi();
window.addEventListener('load', main, { passive: true });

/**
 * Log functionality. The logger that is actually used is in the extension. This
 * function sends the message to the extension with all the information required
 * to log it.
 *
 * @param level logging level.
 * @param object the object to be logged
 */
function log(object: any = {}, level: string = 'info') {
  sendMessageToExtension({ level: level, command: 'log', object: object });
}

function main() {
  const registersTable = new RegistersTable();
  const memoryTable = new MemoryTable();

  window.addEventListener('message', (event) => {
    dispatch(event, registersTable, memoryTable);
  });


  
  // setUpMemoryConfig(memoryTable);
  // setupImportRegisters(registersTable);
  // setupImportMemory(memoryTable);
  setUpConvert();
  setupSettings(memoryTable);
  setUpHelp();
}

function dispatch(
  event: MessageEvent,
  registersTable: RegistersTable,
  memoryTable: MemoryTable
) {
  log({ msg: 'Dispatching message', data: event.data });
  const data = event.data;
  switch (data.operation) {
    case 'uploadProgram':
      uploadProgram(memoryTable, registersTable, data.program);
      break;
    case 'step':
      step(memoryTable, registersTable);
      // memoryTable.updatePC(data.pc);
      break;
    case 'setRegister':
      registersTable.setRegister(data.register, data.value);
    // if (data.register === 'x2') {
    //   // memoryTable.setSP(data.value);
    // }
    default:
      log({ msg: 'No handler for message', data: data.command });
      break;
  }
}

function uploadProgram(memoryTable: MemoryTable, registersTable: RegistersTable, ir: InternalRepresentation): void {
  UIManager.getInstance(memoryTable, registersTable ).configuration();
  memoryTable.uploadProgram(ir);
  memoryTable.allocateMemory();
  }

function step(memoryTable: MemoryTable, registersTable: RegistersTable): void {
  log({ msg: "Simulator reported step" });
  if (!UIManager.getInstance(memoryTable, registersTable ).isSimulating) {
    UIManager.getInstance(memoryTable, registersTable ).simulationStarted();
    memoryTable.disableEditors();
  }
}



function setupSettings(memoryTable: MemoryTable) {
  const inputMemorySize = document.getElementById(
    'memorySizeInput'
  ) as HTMLInputElement;
  
  inputMemorySize.addEventListener('change', () => {
    if( Number.parseInt(inputMemorySize.value) < 32){
      inputMemorySize.value = '32';
    }
    sendMessageToExtension({
      command: 'event',
      object: { name: 'memorySizeChanged', value: inputMemorySize.value }
    });
    const newSize = Number.parseInt(inputMemorySize.value);
    memoryTable.resizeMemory(newSize);
  });
}



function setUpHelp() {
  const openShowCard = document.getElementById('openShowCard');

  if (!openShowCard) {
    console.error('Help button not found');
    return;
  }

  openShowCard.addEventListener('click', () => {
    sendMessageToExtension({
      command: 'event',
      object: { name: 'clickOpenRISCVCard', value: 'openHelp' }
      // from: 'registerView',
      // message: 'registerUpdate',
      // name: rawName,
      // value: value
    });
  });


}


/**
 * View extension communication.
 * @param messageObject message to send to the extension
 */
function sendMessageToExtension(messageObject: any) {
  vscode.postMessage(messageObject);
}



