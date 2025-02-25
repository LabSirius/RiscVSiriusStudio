import {
    CellComponent,
    ColumnDefinition,
    GroupComponent,
    TabulatorFull as Tabulator
} from 'tabulator-tables';

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
} from '../../utilities/conversions';



/**
 * Name generation for the froups in the table.
 * @returns The name of the group according to the number of watched and
 * unwatched registers.
 */
export function headerGrouping(
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
 * Formatter for the column containing the register's name.
 *
 * This is just for the text. The style is modified using css.
 * @param cell to format
 * @param formatterParams not used
 * @param onRendered not used
 * @returns the name for the register in the view
 */
export function registerNamesFormatter(
    cell: CellComponent,
    formatterParams: any,
    onRendered: any
  ) {
    const { name } = cell.getData();
    const [xname, abiname] = name.split(' ');
    return xname + ' (' + abiname + ')';
  }


/**
 * Computes the textual representation of each value in the table based on its
 * type.
 * @param cell to be formatted
 * @param formatterParams not used
 * @param onRendered not used
 * @returns the text to display in the view
 */
export function valueFormatter(
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
export function valueRegisterEditor(
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
    // log('info', { msg: 'none of the test matched', type: valType });
    return false;
  }


/**
 *
 * @param cell Function called by tabulator to decide whether a cell can be edited.
 */
export function editableValue(cell: CellComponent) {
    const { name } = cell.getRow().getData();
    return name !== 'x0 zero';
  }
  


/**
 * Triggers format on the register value when a cell in the view type is
 * detected. This will call {@function formatValueAsType} to refresh the view of
 * the register value according to the new view type.
 * @param cell modified view type cell
 */
export function viewTypeEdited(cell: CellComponent) {
    cell.getRow().reformat();
}


/**
 * Formats the elements in the type column.
 * @param cell to be rendered
 * @param formatterParams not used
 * @param onRendered not used
 * @returns html code for the rendered view
 */
export function viewTypeFormatter(
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
    return `<div >${tag}</div>`;
  }
  