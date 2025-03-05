import {
  provideVSCodeDesignSystem,
  allComponents
} from '@vscode/webview-ui-toolkit';

import { setUpConvert } from './convertTool';
import { UIManager } from './uiManager';

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

  UIManager.createInstance(sendMessageToExtension);

  window.addEventListener('message', (event) => {
    dispatch(event);
  });

  setUpConvert();
}

function dispatch(
  event: MessageEvent,
) {
  log({ msg: 'Dispatching message', data: event.data });
  const data = event.data;
  switch (data.operation) {
    case 'uploadMemory':
      uploadMemory(data.memory, data.codeSize, data.symbols);
      break;
    case 'step':
      step( data.pc);
      UIManager.getInstance().memoryTable.updatePC(data.pc);
      break;
    case 'setRegister':
      setRegister(data.register, data.value);
      break;
    default:
      log({ msg: 'No handler for message', data: data.operation });
      break;
  }
}

function uploadMemory(
  memory: string[], codeSize: number, symbols: any[]): void {
  UIManager.getInstance().configuration();
  UIManager.getInstance().memoryTable.uploadMemory(memory, codeSize, symbols);
}

function step(pc: number): void {
  log({ msg: "Simulator reported step" });
  if (!UIManager.getInstance().isSimulating) {
    UIManager.getInstance().simulationStarted();
    UIManager.getInstance().memoryTable.disableEditors();
  }
  UIManager.getInstance().memoryTable.updatePC(pc);
}

function setRegister(
  register: string, value: string
): void {
  UIManager.getInstance().registersTable.setRegister(register, value);
  if (register === 'x2') {
    UIManager.getInstance().memoryTable.setSP(value);
  }
}

/**
 * View extension communication.
 * @param messageObject message to send to the extension
 */
function sendMessageToExtension(messageObject: any) {
  vscode.postMessage(messageObject);
}







