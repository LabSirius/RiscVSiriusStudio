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

  UIManager.createInstance(sendMessageToExtension, sendMessageToPanelView);

  window.addEventListener('message', (event) => {
    dispatch(event);
  });
}

function dispatch(
  event: MessageEvent,
) {
  log({ msg: 'Dispatching message', data: event.data });
  const data = event.data;

  switch (data.from) {
    case 'extension':
      switch (data.operation) {
      case 'uploadMemory':
        const { from, ...newData } = data;
        UIManager.getInstance()._sendMessageToReact(newData);
        break;
      }
    case 'react':
      switch (data.event) {
        case 'memorySizeChanged':
          UIManager.getInstance()._sendMessageToExtension(
            {
              command: 'event',
              object: { event: 'memorySizeChanged', value: data.data.sizeMemory }
            }
          );
          break;
        case 'registersChanged':
          UIManager.getInstance()._sendMessageToExtension(
            {
              command: 'event',
              object: { event: 'registersChanged', value: data.data.registers }
            }
          );
          break;
        default:
          log({ msg: 'Unknown operation', data: data });
          break;
      }
  }
}


/**
 * View extension communication.
 * @param messageObject message to send to the extension
 */
function sendMessageToExtension(messageObject: any) {
  vscode.postMessage(messageObject);
}

function sendMessageToPanelView(data: any) {
  window.postMessage({ from: 'UIManager', data }, '*');
}





