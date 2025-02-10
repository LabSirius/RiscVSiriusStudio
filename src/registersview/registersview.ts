import {
  provideVSCodeDesignSystem,
  allComponents
} from '@vscode/webview-ui-toolkit';

import {
  CellComponent,
  GroupComponent,
  RowComponent,
  TabulatorFull as Tabulator
} from 'tabulator-tables';

import { fromPairs, range } from 'lodash';

import {
  binaryToUInt,
  binaryToInt,
  binaryToHex,
  binaryToAscii,
  binaryRepresentation,
  validUInt32,
  validInt32,
  validHex,
  validBinary,
  validAscii,
  toBinary
} from '../utilities/conversions';

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

/**
 * Type definition for the possible views on a binary string.
 *
 * - 2: binary view
 * - "signed": as a signed decimal number
 * - "unsigned": as an unsigned decimal number
 * - 16: as an hexadecimal number
 * - ascii: as a sequence of 8 bits ascii characters (left to right)
 */
const possibleViews = [2, 'signed', 'unsigned', 16, 'ascii'];
type RegisterView = typeof possibleViews[number];

type RegisterValue = {
  name: string;
  rawName: string;
  value: string;
  watched: boolean;
  modified: number;
  id: number;
  viewType: RegisterView;
};

function main() {
  let registersTable = registersSetup();
  let memoryTable = memorySetup();
  setupTabs();
  window.addEventListener('message', (event) => {
    dispatch(event, registersTable, memoryTable);
  });

}

function registersSetup(): Tabulator {
  const startTime = Date.now();
  const registers = [
    'x0 zero',
    'x1 ra',
    'x2 sp',
    'x3 gp',
    'x4 tp',
    'x5 t0',
    'x6 t1',
    'x7 t2',
    'x8 s0',
    'x9 s1',
    'x10 a0',
    'x11 a1',
    'x12 a2',
    'x13 a3',
    'x14 a4',
    'x15 a5',
    'x16 a6',
    'x17 a7',
    'x18 s2',
    'x19 s3',
    'x20 s4',
    'x21 s5',
    'x22 s6',
    'x23 s7',
    'x24 s8',
    'x25 s9',
    'x26 s10',
    'x27 s11',
    'x28 t3',
    'x29 t4',
    'x30 t5',
    'x31 t6'
  ];
  let tableData = [] as Array<RegisterValue>;
  let table = new Tabulator('#tabs-registers', {
    layout: 'fitColumns',
    layoutColumnsOnNewData: true,
    index: 'rawName',
    reactiveData: true,
    groupBy: 'watched',
    groupValues: [[true, false]],
    groupHeader: hederGrouping,
    groupUpdateOnCellEdit: true,
    movableRows: true,
    validationMode: 'blocking',
    columns: [
      {
        title: 'Name',
        field: 'name',
        visible: true,
        headerSort: false,
        cssClass: 'register-name',
        frozen: true,
        width: 90,
        formatter: registerNamesFormatter
      },
      {
        title: 'Value',
        field: 'value',
        visible: true,
        width: 160,
        headerSort: false,
        cssClass: 'register-value',
        formatter: valueFormatter,
        editor: valueEditor,
        editable: editableValue
      },
      {
        title: '',
        field: 'viewType',
        visible: true,
        width: 60,
        headerSort: false,
        editor: 'list',
        cellEdited: viewTypeEdited,
        editorParams: {
          values: possibleViews,
          allowEmpty: false,
          freetext: false
        },
        formatter: viewTypeFormatter
      },
      { title: 'Watched', field: 'watched', visible: false },
      { title: 'Modified', field: 'modified', visible: false },
      { title: 'id', field: 'id', visible: false },
      { title: 'rawName', field: 'rawName', visible: false }
    ]
  });

  registers.forEach((e, idx) => {
    const [xname, abi] = e.split(' ');
    const zeros32 = '0';
    tableData.push({
      name: `${xname} ${abi}`,
      rawName: `${xname}`,
      value: zeros32,
      viewType: 2,
      watched: false,
      modified: 0,
      id: idx
    });
  });

  table.on('tableBuilt', () => {
    table.setData(tableData);
  });

  // table.on('rowDblClick', toggleWatched);
  // table.on('cellEdited', modifiedCell);
  // table.on('cellEdited', notifyExtension);
  table.on('tableBuilt', () => { log({ buildingTime: (Date.now() - startTime) / 1000, table: "Registers" }); });
  return table;
}

function memorySetup(): Tabulator {
  const startTime = Date.now();
  const memorySize = 1024;
  let tableData: any[] = []; //as Array<MemWord>;
  let table = new Tabulator('#tabs-memory', {
    layout: 'fitColumns',
    layoutColumnsOnNewData: true,
    index: 'address',
    reactiveData: true,
    validationMode: 'blocking',
    columns: [
      {
        title: '',
        field: 'info',
        visible: true,
        formatter: 'html',
        headerSort: false,
        frozen: true,
        width: 20
      },
      {
        title: 'Addr.',
        field: 'address',
        visible: true,
        headerSort: false,
        frozen: true,
        width: 50
      },
      {
        title: '0x3',
        field: 'value3',
        formatter: 'html',
        headerHozAlign: 'center',
        visible: true,
        headerSort: false,
        width: 80
      },
      {
        title: '0x2',
        field: 'value2',
        formatter: 'html',
        headerHozAlign: 'center',
        visible: true,
        headerSort: false,
        width: 80
      },
      {
        title: '0x1',
        field: 'value1',
        formatter: 'html',
        headerHozAlign: 'center',
        visible: true,
        headerSort: false,
        width: 80
      },
      {
        title: '0x0',
        field: 'value0',
        formatter: 'html',
        headerHozAlign: 'center',
        visible: true,
        headerSort: false,
        width: 80
      },
      {
        title: 'HEX',
        field: 'hex',
        headerHozAlign: 'center',
        visible: true,
        headerSort: false,
        width: 90
      }
    ]
  });

  range(0, memorySize / 4).forEach((address) => {
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

  table.on('tableBuilt', () => {
    table.setData(tableData);
    log({ buildingTime: (Date.now() - startTime) / 1000, table: "Memory" });
  });
  return table;
}

function setupTabs() {
  log({ msg: "Setting up tabs tab", func: "setupTabs" });

  const tabs = document.querySelectorAll('div button');
  const contents = document.querySelectorAll('[id$="-content"]');

  // Make contents of all but the first tab invisible for the initial load
  contents.forEach((c, index) => {
    if (index !== 0) {
      c.classList.add('invisible');
    }
  });

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      log({ msg: "Adding listener to tab", func: "setupTabs" });
      // Remove active state from all tabs
      tabs.forEach(t => {
        // t.classList.remove('text-blue-600');
        // t.classList.add('text-gray-500');
      });

      // Hide all content panels
      contents.forEach(c => c.classList.add('invisible'));

      // Activate clicked tab
      // tab.classList.remove('text-gray-500');
      // tab.classList.add('text-blue-600', 'bg-white');

      // Show corresponding content
      contents[index].classList.remove('invisible');
    });
  });
}

function dispatch(event: MessageEvent, registersTable: Tabulator, memoryTable: Tabulator) {
  log({ msg: "Dispatching message", data: event.data });

  // const data = event.data;
  // switch (data.operation) {
  //   case 'hideRegistersView':
  //     hideRegistersView();
  //     break;
  //   case 'showRegistersView':
  //     showRegistersView();
  //     break;
  //   case 'selectRegister':
  //     selectRegister(data.register, table);
  //     break;
  //   case 'setRegister':
  //     setRegister(data.register, data.value, table);
  //     break;
  //   case 'clearSelection':
  //     table.deselectRow();
  //     break;
  //   case 'watchRegister':
  //     watchRegister(data.register, table);
  //     break;
  //   case 'settingsChanged':
  //     settingsChanged(data.settings, table);
  //     break;
  //   default:
  //     throw new Error('Unknown operation ' + data.operation);
  // }
}

function main2() {
  let table = tableSetup();
  table.on('cellEdited', () => {
    sortTable(table);
  });
  // Install message dispatcher when the table has been built
  table.on('tableBuilt', () => {
    window.addEventListener('message', (event) => {
      dispatch(event, table);
    });
    hideRegistersView();
  });
}

function dispatch2(event: MessageEvent, table: Tabulator) {
  const data = event.data;
  switch (data.operation) {
    case 'hideRegistersView':
      hideRegistersView();
      break;
    case 'showRegistersView':
      showRegistersView();
      break;
    case 'selectRegister':
      selectRegister(data.register, table);
      break;
    case 'setRegister':
      setRegister(data.register, data.value, table);
      break;
    case 'clearSelection':
      table.deselectRow();
      break;
    case 'watchRegister':
      watchRegister(data.register, table);
      break;
    case 'settingsChanged':
      settingsChanged(data.settings, table);
      break;
    default:
      throw new Error('Unknown operation ' + data.operation);
  }
}

function hideRegistersView() {
  const table = document.getElementById('registers-table') as HTMLElement;
  const cover = document.getElementById('registers-cover') as HTMLElement;
  cover.style.display = 'block';
  table.style.display = 'none';
}

function showRegistersView() {
  const table = document.getElementById('registers-table') as HTMLElement;
  const cover = document.getElementById('registers-cover') as HTMLElement;
  cover.style.display = 'none';
  table.style.display = 'block';
}

function settingsChanged(newSettings: any, table: Tabulator) {
  log('info', {
    place: 'registersview',
    m: 'Reacting to new settings',
    n: newSettings
  });

  const { sort, initialSp } = newSettings;
  if (sort !== settings.sort) {
    settings.sort = sort;
    sortTable(table);
  }
  if (initialSp !== settings.initialSp) {
    settings.initialSp = initialSp;
    setRegister('x2', settings.initialSp.toString(2), table);
  }
}

function watchRegister(registerName: string, table: Tabulator) {
  table.updateData([{ rawName: registerName, watched: true }]);
}

function selectRegister(register: string, table: Tabulator) {
  table.selectRow(register);
}

function setRegister(register: string, value: string, table: Tabulator) {
  table.updateRow(register, { value: value, modified: Date.now() });
  sortTable(table);
}

function tableSetup(): Tabulator {
  const registers = [
    'x0 zero',
    'x1 ra',
    'x2 sp',
    'x3 gp',
    'x4 tp',
    'x5 t0',
    'x6 t1',
    'x7 t2',
    'x8 s0',
    'x9 s1',
    'x10 a0',
    'x11 a1',
    'x12 a2',
    'x13 a3',
    'x14 a4',
    'x15 a5',
    'x16 a6',
    'x17 a7',
    'x18 s2',
    'x19 s3',
    'x20 s4',
    'x21 s5',
    'x22 s6',
    'x23 s7',
    'x24 s8',
    'x25 s9',
    'x26 s10',
    'x27 s11',
    'x28 t3',
    'x29 t4',
    'x30 t5',
    'x31 t6'
  ];
  let tableData = [] as Array<RegisterValue>;
  let table = new Tabulator('#tabs-registers', {
    // data: tableData,
    layout: 'fitColumns',
    layoutColumnsOnNewData: true,
    index: 'rawName',
    reactiveData: true,
    groupBy: 'watched',
    groupValues: [[true, false]],
    groupHeader: hederGrouping,
    groupUpdateOnCellEdit: true,
    movableRows: true,
    validationMode: 'blocking',
    maxHeight: '300px',
    height: '300px',
    columns: [
      {
        title: 'Name',
        field: 'name',
        visible: true,
        headerSort: false,
        cssClass: 'register-name',
        frozen: true,
        width: 90,
        formatter: registerNamesFormatter
      },
      {
        title: 'Value',
        field: 'value',
        visible: true,
        headerSort: false,
        cssClass: 'register-value',
        formatter: valueFormatter,
        editor: valueEditor,
        editable: editableValue
      },
      {
        title: '',
        field: 'viewType',
        visible: true,
        width: 60,
        headerSort: false,
        editor: 'list',
        cellEdited: viewTypeEdited,
        editorParams: {
          values: possibleViews,
          allowEmpty: false,
          freetext: false
        },
        formatter: viewTypeFormatter
      },
      { title: 'Watched', field: 'watched', visible: false },
      { title: 'Modified', field: 'modified', visible: false },
      { title: 'id', field: 'id', visible: false },
      { title: 'rawName', field: 'rawName', visible: false }
    ]
  });

  registers.forEach((e, idx) => {
    const [xname, abi] = e.split(' ');
    const zeros32 = '0';
    tableData.push({
      name: `${xname} ${abi}`,
      rawName: `${xname}`,
      value: zeros32,
      viewType: 2,
      watched: false,
      modified: 0,
      id: idx
    });

    table.on('tableBuilt', () => {
      table.setData(tableData);
    });
  });

  table.on('rowDblClick', toggleWatched);
  table.on('cellEdited', modifiedCell);
  table.on('cellEdited', notifyExtension);
  return table;
}

/**
 *
 * @param cell Function called by tabulator to decide whether a cell can be edited.
 */
function editableValue(cell: CellComponent) {
  const { name } = cell.getRow().getData();
  return name !== 'x0 zero';
}

/**
 * Triggers format on the register value when a cell in the view type is
 * detected. This will call {@function formatValueAsType} to refresh the view of
 * the register value according to the new view type.
 * @param cell modified view type cell
 */
function viewTypeEdited(cell: CellComponent) {
  cell.getRow().reformat();
}

/**
 * Computes the representation of value according to view.
 * @param value value in binary format.
 * @param type the requested type.
 * @returns the value represented in the requested type.
 */
function formatValueAsType(value: string, type: RegisterView): string {
  switch (type) {
    case 'unsigned':
      return binaryToUInt(value);
    case 'signed':
      return binaryToInt(value);
    case 16:
      return binaryToHex(value);
    case 'ascii':
      return binaryToAscii(value);
  }
  // type must be binary
  return value;
}

/**
 * Creates an editor for a value cell. This editor takes into account the
 * current view type to present the editied value according to its value.
 *
 * @param cell cell being edited.
 * @param onRendered function to call when the cell is rendered.
 * @param success function to call after a successful edition of the cell.
 * @param cancel function to call when the edition is cancelled.
 * @param editorParams additional parameters.
 * @returns
 */
function valueEditor(
  cell: CellComponent,
  onRendered: any,
  success: any,
  cancel: any,
  editorParams: any
) {
  const { name, value, viewType } = cell.getRow().getData();

  // log('info', {
  //   msg: 'valueEditor called',
  //   rawValue: value,
  //   currentVType: viewType,
  //   reg: name
  // });
  const viewValue = formatValueAsType(value, viewType);

  let editor = document.createElement('input');
  editor.className = 'register-editor';
  editor.value = viewValue;
  editor.select();

  onRendered(function () {
    editor.focus();
  });

  function successFunc() {
    const newValue = editor.value;
    const valid = isValidAs(newValue, viewType);
    // log('info', {
    //   msg: 'called success function',
    //   check: valid,
    //   newValue: newValue,
    //   type: viewType
    // });
    if (valid) {
      const bin = toBinary(newValue, viewType);
      success(bin);
    } else {
      editor.focus();
      editor.className = 'register-editor-error';
    }
  }

  editor.addEventListener('change', successFunc);
  editor.addEventListener('blur', successFunc);
  editor.addEventListener('keydown', (evt) => {
    if (evt.key === 'Escape') {
      cancel();
    }
  });
  return editor;
}

/**
 * Tests whether the binary representation of value is a valid for the cpu.
 * @param value value representation
 * @param valType format in which the value is represented
 * @returns
 */
function isValidAs(value: string, valType: RegisterView) {
  switch (valType) {
    case 2:
      return validBinary(value);
    case 'unsigned':
      return validUInt32(value);
    case 'signed':
      return validInt32(value);
    case 16:
      return validHex(value);
    case 'ascii':
      return validAscii(value);
  }
  log('info', { msg: 'none of the test matched', type: valType });
  return false;
}

/**
 * Computes the textual representation of each value in the table based on its
 * type.
 * @param cell to be formatted
 * @param formatterParams not used
 * @param onRendered not used
 * @returns the text to display in the view
 */
function valueFormatter(
  cell: CellComponent,
  formatterParams: any,
  onRendered: any
) {
  const { value, viewType } = cell.getData();
  switch (viewType) {
    case 2:
      return binaryRepresentation(value);
    case 'signed': {
      return binaryToInt(value);
    }
    case 'unsigned': {
      const rvalue = binaryToUInt(value);
      return rvalue;
    }
    case 16: {
      const rvalue = binaryToHex(value);
      return rvalue;
    }
    case 'ascii': {
      return binaryToAscii(value);
    }
  }
  return value;
}

/**
 * Formatter for the column containing the register's name.
 *
 * This is just for the text. The style is modified using css.
 * @param cell to format
 * @param formatterParams not used
 * @param onRendered not used
 * @returns the name for the register in the view
 */
function registerNamesFormatter(
  cell: CellComponent,
  formatterParams: any,
  onRendered: any
) {
  const { name } = cell.getData();
  const [xname, abiname] = name.split(' ');
  return xname + ' (' + abiname + ')';
}

/**
 * Formats the elements in the type column.
 * @param cell to be rendered
 * @param formatterParams not used
 * @param onRendered not used
 * @returns html code for the rendered view
 */
function viewTypeFormatter(
  cell: CellComponent,
  formatterParams: any,
  onRendered: any
) {
  const { viewType } = cell.getData();
  let tag: string = '';
  switch (viewType) {
    case 2:
      tag = 'bin';
      break;
    case 'unsigned':
      tag = '10';
      break;
    case 'signed':
      tag = '±10';
      break;
    case 16:
      tag = 'hex';
      break;
    default:
      tag = viewType;
      break;
  }
  return `<button class="view-type">${tag}</button>`;
  // return `<vscode-tag class="view-type">${tag}</vscode-tag>`;
  // return '<vscode-tag><img src="binary-svgrepo-com.svg"></img></vscode-tag>';
}

/**
 * Assigns an increasing number (time based) when a cell is editted. This allows
 * for sorting the table according to modification of values.
 * @param cell that was editted
 */
function modifiedCell(cell: CellComponent) {
  cell.getRow().update({ modified: Date.now() });
}

function notifyExtension(cell: CellComponent) {
  const { rawName, value } = cell.getData();
  log('info', { msg: 'notify extension', name: rawName, val: value });
  sendMessageToExtension({
    command: 'event',
    from: 'registerView',
    message: 'registerUpdate',
    name: rawName,
    value: value
  });
}
/**
 * Toggles the value of the watched field in a row
 * @param event
 * @param row to toggle watched value for.
 */
function toggleWatched(event: UIEvent, row: RowComponent) {
  const { rawName: rn, watched: w } = row.getData();
  row.update({ rawName: rn, watched: !w }).catch((error) => {
    log('info', { message: 'update error', rawName: rn, watched: w });
  });
}

/**
 * Name generation for the froups in the table.
 * @returns The name of the group according to the number of watched and
 * unwatched registers.
 */
function hederGrouping(
  value: boolean,
  count: number,
  data: any,
  group: GroupComponent
) {
  let watchStr = 'Watched';
  if (!value) {
    watchStr = 'Unwatched';
  }
  return watchStr + '  (' + count + ' registers)';
}

/**
 * Sets the sorting of the table view to either last modification or "register
 * name" criteria.
 * @param table view to sort
 */
function sortTable(table: Tabulator) {
  // log('info', {
  //   m: 'sortingTable',
  //   sort: settings.sort,
  //   place: 'registersview'
  // });
  if (settings.sort === 'name') {
    table.setSort('id', 'asc');
  } else {
    // Assume last modified sort
    table.setSort('modified', 'desc');
  }
}

/**
 * View extension communication.
 * @param messageObject message to send to the extension
 */
function sendMessageToExtension(messageObject: any) {
  vscode.postMessage(messageObject);
}
