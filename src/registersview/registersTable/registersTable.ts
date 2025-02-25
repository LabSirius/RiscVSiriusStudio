import {
  CellComponent,
  GroupComponent,
  ColumnDefinition,
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




// export function setupImportRegisters(registersTable: Tabulator) {
//   document
//     .getElementById("importRegisterBtn")
//     ?.addEventListener("click", () => {
//       document.getElementById("fileInputImportRegister")?.click(); // Open file dialog
//     });

//   document
//     .getElementById("fileInputImportRegister")
//     ?.addEventListener("change", (event) => {
//       const input = event.target as HTMLInputElement;
//       const file = input.files?.[0];

//       if (!file) {
//         return;
//       }

//       const reader = new FileReader();

//       reader.onload = function (e) {
//         if (!e.target?.result) {
//           return;
//         }

//         const lines = (e.target.result as string)
//           .split("\n")
//           .map((line) => line.trim()) // delete leading and trailing spaces
//           .filter((line) => line !== ""); // delete empty lines

//         if (lines.length !== 32) {
//           console.error("Invalid number of lines");
//           return;
//         }

//         for (let i = 0; i < lines.length; i++) {
//           if (lines[i].length !== 32) {
//             console.error(`Invalid length in line ${i}`);
//             return;
//           }
//         }
//         const newData = registersNames.map((reg, index) => ({
//           name: reg,
//           rawName: reg.split(" ")[0],
//           value: index === 0 ? "00000000000000000000000000000000" : lines[index],
//           viewType: 2,
//           watched: false, // Todos los registros entran como "watched: true"
//           modified: 0,
//           id: index,
//         }));

//         registersTable.setData(newData);
//       };
//       reader.readAsText(file);
//     });
// }


export class RegistersTable {
  public table: Tabulator;

  /**
 * Name generation for the froups in the table.
 * @returns The name of the group according to the number of watched and
 * unwatched registers.
 */
  private readonly headerGrouping = (
  value: boolean,
  count: number,
  data: any,
  group: GroupComponent
) => {
  let watchStr = 'Watched';
  if (!value) {
    watchStr = 'Unwatched';
  }
  return watchStr + '  (' + count + ' registers)';
};

 /**
 * Formatter for the column containing the register's name.
 *
 * This is just for the text. The style is modified using css.
 * @param cell to format
 * @param formatterParams not used
 * @param onRendered not used
 * @returns the name for the register in the view
 */
  private readonly registerNamesFormatter = (
  cell: CellComponent,
  formatterParams: any,
  onRendered: any
)  => {
  const { name } = cell.getData();
  const [xname, abiname] = name.split(' ');
  return xname + ' (' + abiname + ')';
  };

  /**
   * Computes the textual representation of each value in the table based on its
   * type.
   * @param cell to be formatted
   * @param formatterParams not used
   * @param onRendered not used
   * @returns the text to display in the view
   */
    private readonly valueFormatter = (
    cell: CellComponent,
    formatterParams: any,
    onRendered: any
  ) => {
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
  };

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
  private readonly valueRegisterEditor = (
  cell: CellComponent,
  onRendered: any,
  success: any,
  cancel: any,
  editorParams: any
) => {
  const { name, value, viewType } = cell.getRow().getData();

  // log('info', {
  //   msg: 'valueEditor called',
  //   rawValue: value,
  //   currentVType: viewType,
  //   reg: name
  // });
  const viewValue = this.formatValueAsType(value, viewType);

  let editor = document.createElement('input');
  editor.className = 'register-editor';
  editor.value = viewValue;
  editor.select();

  onRendered(function () {
    editor.focus();
  });

  const successFunc = () => {
    const newValue = editor.value;
    const valid = this.isValidAs(newValue, viewType);
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
  };

  editor.addEventListener('change', successFunc);
  editor.addEventListener('blur', successFunc);
  editor.addEventListener('keydown', (evt) => {
    if (evt.key === 'Escape') {
      cancel();
    }
  });
  return editor;
};

 /**
   * Tests whether the binary representation of value is a valid for the cpu.
   * @param value value representation
   * @param valType format in which the value is represented
   * @returns
   */
  private isValidAs = (value: string, valType: RegisterView) => { 
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
};


/**
   * Computes the representation of value according to view.
   * @param value value in binary format.
   * @param type the requested type.
   * @returns the value represented in the requested type.
   */
private readonly formatValueAsType = (value: string, type: RegisterView): string => {
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
};


/**
 *
 * @param cell Function called by tabulator to decide whether a cell can be edited.
 */
 private readonly editableValue = (cell: CellComponent) => { 
  const { name } = cell.getRow().getData();
  return name !== 'x0 zero';
};

/**
 * Triggers format on the register value when a cell in the view type is
 * detected. This will call {@function formatValueAsType} to refresh the view of
 * the register value according to the new view type.
 * @param cell modified view type cell
 */
 private readonly viewTypeEdited = (cell: CellComponent) => { 
  cell.getRow().reformat();
};

/**
 * Formats the elements in the type column.
 * @param cell to be rendered
 * @param formatterParams not used
 * @param onRendered not used
 * @returns html code for the rendered view
 */
private readonly viewTypeFormatter = ( 
  cell: CellComponent,
  formatterParams: any,
  onRendered: any
) => {
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
};



  private readonly registersNames = [
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

  private readonly possibleViews = [2, 'signed', 'unsigned', 16, 'ascii'];

  public constructor() {
    this.table = this.initializeTable();
    this.initRegisterNames();
  }

  private initializeTable(): Tabulator {
    return new Tabulator('#tabs-registers', {
      layout: 'fitColumns',
      layoutColumnsOnNewData: true,
      index: 'rawName',
      reactiveData: true,
      groupBy: 'watched',
      groupValues: [[true, false]],
      groupHeader: this.headerGrouping,
      groupUpdateOnCellEdit: true,
      movableRows: true,
      validationMode: 'blocking',
      columns: this.getColumnDefinitions()
    });
  }

  private getColumnDefinitions(): ColumnDefinition[] {
    return [
      {
        title: 'Name',
        field: 'name',
        visible: true,
        headerSort: false,
        cssClass: 'register-name',
        frozen: true,
        width: 90,
        formatter: this.registerNamesFormatter
      },
      {
        title: 'Value',
        field: 'value',
        visible: true,
        width: 160,
        headerSort: false,
        cssClass: 'register-value',
        formatter: this.valueFormatter,
        editor: this.valueRegisterEditor,
        editable: this.editableValue
      },
      {
        title: '',
        field: 'viewType',
        visible: true,
        width: 60,
        headerSort: false,
        editor: 'list',
        cellEdited: this.viewTypeEdited,
        editorParams: {
          values: this.possibleViews,
          allowEmpty: false,
          freetext: false
        },
        formatter: this.viewTypeFormatter
      },
      { title: 'Watched', field: 'watched', visible: false },
      { title: 'Modified', field: 'modified', visible: false },
      { title: 'id', field: 'id', visible: false },
      { title: 'rawName', field: 'rawName', visible: false }
    ];
  }

  private initRegisterNames() {
    let tableData = [] as Array<RegisterValue>;
    this.registersNames.forEach((e, idx) => {
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

    this.table.on('tableBuilt', () => {
      this.table.setData(tableData);
    });
  }

  private makeRegisterVissible(name: string) {
    // TODO: This should only happens if the row is not already visible
    this.table.scrollToRow(name, "top", true);
  }

  private animateRegister(name: string) {
    const row = this.table.getRow(name);
    if (row) {
      // row.getElement().classList.add('animate-register');
      row.getElement().style.backgroundColor = '#FF0000';
      setTimeout(() => {
        row.getElement().style.backgroundColor = '';
        // row.getElement().classList.remove('animate-register');
      }, 1000);
    }
  }

  public setRegister(name: string, value: string) {
    console.log('setting register', name, value);
    const regValue = {
      rawName: name,
      value: value,
    };
    this.table.updateData([regValue]);
    this.makeRegisterVissible(name);
    this.animateRegister(name);
  }


  public filterTableData(searchInput: string): void {
    this.resetCellColors();

    if (searchInput.toLowerCase().startsWith("0x")) {
      const hexPart = searchInput.slice(2);
      const num = parseInt(hexPart, 16);
      const binaryHex = num.toString(2);

      this.table.setFilter((data: any) => {
        const valueStr = data.value?.toString().toLowerCase() || "";
        return valueStr.includes(binaryHex);
      });

      this.table.getRows().forEach(row => {
        row.getCells().forEach(cell => {
          if (cell.getField() === "value") {
            const cellValue = cell.getValue()?.toString().toLowerCase() || "";
            if (cellValue.includes(binaryHex)) {
              cell.getElement().style.backgroundColor = "#D1E3E7";
            }
          }
        });
      });
    } else {
      const lowerSearch = searchInput.toLowerCase();
      let isNumeric = false;
      let candidateFromDecimal = "";
      let candidateFromUnsigned = "";

      if (/^[01]+$/.test(searchInput)) {
        isNumeric = true;
        candidateFromDecimal = searchInput.replace(/^0+/, '') || "0";
        candidateFromUnsigned = searchInput.padStart(32, '0');
      } else if (!isNaN(parseInt(searchInput, 10))) {
        isNumeric = true;
        const parsed = parseInt(searchInput, 10);
        if (parsed < 0) {
          const bits = 8;
          candidateFromDecimal = ((1 << bits) + parsed).toString(2).padStart(bits, '0');
        } else {
          candidateFromDecimal = parsed.toString(2);
        }
        candidateFromUnsigned = parsed.toString(2).padStart(32, '0');
      }

      this.table.setFilter((data: any) => {
        const nameStr = data.name?.toLowerCase() || "";
        const valueStr = data.value?.toString().toLowerCase() || "";
        if (isNumeric) {
          return (
            nameStr.includes(lowerSearch) ||
            nameStr.includes(candidateFromDecimal) ||
            nameStr.includes(candidateFromUnsigned) ||
            valueStr.includes(lowerSearch) ||
            valueStr.includes(candidateFromDecimal) ||
            valueStr.includes(candidateFromUnsigned)
          );
        } else {
          return nameStr.includes(lowerSearch) || valueStr.includes(lowerSearch);
        }
      });

      this.table.getRows().forEach(row => {
        row.getCells().forEach(cell => {
          const field = cell.getField();
          const cellValue = cell.getValue()?.toString().toLowerCase() || "";
          if (isNumeric) {
            if ((field === "name" || field === "value") &&
              (cellValue.includes(lowerSearch) ||
                cellValue.includes(candidateFromDecimal) ||
                cellValue.includes(candidateFromUnsigned))) {
              cell.getElement().style.backgroundColor = "#D1E3E7";
            }
          } else {
            if ((field === "name" || field === "value") && cellValue.includes(lowerSearch)) {
              cell.getElement().style.backgroundColor = "#D1E3E7";
            }
          }
        });
      });
    }
  }

  public resetCellColors(): void {
    this.table.getRows().forEach(row => {
      row.getCells().forEach(cell => {
        cell.getElement().style.backgroundColor = "";
      });
    });
  }

  public importRegisters(content: string): void {
    const lines = content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");

    if (lines.length !== 32) {
      console.error("Número inválido de líneas");
      return;
    }

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].length !== 32) {
        console.error(`Longitud inválida en la línea ${i}`);
        return;
      }
    }

    const newData = this.registersNames.map((reg, index) => ({
      name: reg,
      rawName: reg.split(" ")[0],
      value: index === 0 ? "00000000000000000000000000000000" : lines[index],
      viewType: 2,
      watched: false,
      modified: 0,
      id: index,
    }));

    this.table.setData(newData);
  }


}


