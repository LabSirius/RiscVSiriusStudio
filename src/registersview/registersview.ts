import {
  provideVSCodeDesignSystem,
  allComponents
} from '@vscode/webview-ui-toolkit';

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

}

function dispatch(
  event: MessageEvent,
) {
  log({ msg: 'Dispatching message', data: event.data });
  const data = event.data;
  switch (data.operation) {
    case 'uploadMemory':
      UIManager.getInstance().uploadMemory(data.memory, data.codeSize, data.symbols);
      
      break;
    case 'step':
      UIManager.getInstance().step(data.pc, log);
      break;
    case 'setRegister':
      UIManager.getInstance().registersTable.setRegister(data.register, data.value);
      if (data.register === 'x2') {
        UIManager.getInstance().memoryTable.setSP(data.value);
      }
      break;
      case 'readMemory':
        UIManager.getInstance().memoryTable.animateMemorycell( data.address, data._length);
        break;
      case 'writeMemory':
        UIManager.getInstance().memoryTable.setMemoryCell( data.address, data._length, data.value);
        break;
    case 'stop':
      UIManager.getInstance().resetUI();
      break;
    default:
      log({ msg: 'No handler for message', data: data.operation });
      break;
  }
}


/**
 * View extension communication.
 * @param messageObject message to send to the extension
 */
function sendMessageToExtension(messageObject: any) {
  vscode.postMessage(messageObject);
}







