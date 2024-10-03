import {
  provideVSCodeDesignSystem,
  allComponents
} from '@vscode/webview-ui-toolkit';

import { TabulatorFull as Tabulator } from 'tabulator-tables';

import {fromPairs, range} from 'lodash';

provideVSCodeDesignSystem().register(allComponents);

const vscode = acquireVsCodeApi();
window.addEventListener('load', main);

/**
 * Global and ugly way to store the relevant settings for this view. I have to
 * find the way of passing the object to the view.
 */
const settings = { memorySize: 128 };

/**
 * Log functionality. The logger that is actually used is in the extension. This
 * function sends the message to the extension with all the information required
 * to log it.
 *
 * @param kind the logger type. Can be info, error, etc.
 * @param object the object to be logged/
 */
function log(kind: string, object: any = {}) {
  sendMessageToExtension({ command: 'log-' + kind, obj: { object } });
}

/**
 * Type definition for a memory word. Memory is byte addressable but in the user
 * interface is displayed as chunks of 4 bytes hence words.
 */
type MemWord = {
  address: string;
  value0: string;
  value1: string;
  value2: string;
  value3: string;
  info: string;
  hex: string;
};

function main() {
  let table = tableSetup();
  // Message dispatcher
  window.addEventListener('message', (event) => {
    dispatch(event, table);
  });
  hideDataMemView();
}

function dispatch(event: MessageEvent, table: Tabulator) {
  const data = event.data;
  switch (data.operation) {
    case 'hideDataMemView':
      hideDataMemView();
      break;
    case 'showDataMemView':
      showDataMemView();
      break;
    // case 'select':
    //   select(data.address, data.length, table);
    //   break;
    case 'write':
      write(data.address, data.value, data.bytes, table);
      break;
    case 'clearSelection':
      table.deselectRow();
      break;
    case 'settingsChanged':
      settingsChanged(data.settings, table);
      break;
    default:
      throw new Error('Unknown operation ' + data.operation);
  }
}

function hideDataMemView() {
  const table = document.getElementById('datamem-table') as HTMLElement;
  const cover = document.getElementById('datamem-cover') as HTMLElement;
  cover.style.display = 'block';
  table.style.display = 'none';
}

function showDataMemView() {
  const table = document.getElementById('datamem-table') as HTMLElement;
  const cover = document.getElementById('datamem-cover') as HTMLElement;
  cover.style.display = 'none';
  table.style.display = 'block';
}

function write(
  address: string,
  value: string,
  bytes: number,
  table: Tabulator
) {
  let address10 = parseInt(address, 2);
  const chunks = value.match(/.{1,8}/g);
  for (let i = 0; i < bytes; i++) {
    const row = Math.floor((address10 + i) / 4);
    const col = Math.floor((address10 + i) % 4);
    const updateObject = fromPairs([
      [
        'value' + col,
        `<span class="text-primary fw-bold">${chunks[3 - i]}</span>`
      ]
    ]);
    table.getRows()[row].update(updateObject);
  }
}
function settingsChanged(newSettings: any, table: Tabulator) {
  const { memorySize } = newSettings;
  if (memorySize !== settings.memorySize) {
    log('info', { m: 'Memory size changed', newValue: memorySize });
    settings.memorySize = memorySize;
    // change the table size
    // table.redraw();
  }
}

function tableSetup(): Tabulator {
  let tableData = [] as Array<MemWord>;
  let table = new Tabulator('#datamem-table', {
    data: tableData,
    layout: 'fitColumns',
    layoutColumnsOnNewData: true,
    index: 'address',
    reactiveData: true,
    validationMode: 'blocking',
    maxHeight: "300px",
    height: "300px",
    columns: [
      {
        title: 'Address',
        field: 'address',
        visible: true,
        headerSort: false,
        frozen: true,
        minWidth: 20
      },
      {
        title: '0x3',
        field: 'value3',
        formatter: 'html',
        headerHozAlign: 'center',
        visible: true,
        headerSort: false
      },
      {
        title: '0x2',
        field: 'value2',
        formatter: 'html',
        headerHozAlign: 'center',
        visible: true,
        headerSort: false
      },
      {
        title: '0x1',
        field: 'value1',
        formatter: 'html',
        headerHozAlign: 'center',
        visible: true,
        headerSort: false
      },
      {
        title: '0x0',
        field: 'value0',
        formatter: 'html',
        headerHozAlign: 'center',
        visible: true,
        headerSort: false
      },
      {
        title: '',
        field: 'hex',
        headerHozAlign: 'center',
        visible: false,
        headerSort: false
      }
    ]
  });

  range(0, settings.memorySize / 4).forEach((address) => {
    const zeros8 = '00000000';
    tableData.push({
      address: (address * 4).toString(16),
      value0: zeros8,
      value1: zeros8,
      value2: zeros8,
      value3: zeros8,
      info: '',
      hex: '00-00-00-00'
    });
  });

  return table;
}

/**
 * View extension communication.
 * @param messageObject message to send to the extension
 */
function sendMessageToExtension(messageObject: any) {
  vscode.postMessage(messageObject);
}
