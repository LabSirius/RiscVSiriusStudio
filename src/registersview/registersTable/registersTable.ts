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
  ) => {
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
      case 2: {
        const intValue = Number(binaryToInt(value));
        const binStr = binaryRepresentation(value);
        if (intValue < 0) {
          return `<span style="color: #3A6973;">${binStr}</span>`;
        }
        return binStr;
      }
      case 'signed': {
        return binaryToInt(value);
      }
      case 'unsigned': {
        return binaryToUInt(value);
      }
      case 16: {
        return binaryToHex(value);
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
  ): HTMLElement => {
    const { viewType } = cell.getData();
    let tag = "";
    switch (viewType) {
      case 2:
        tag = "bin";
        break;
      case "unsigned":
        tag = "10";
        break;
      case "signed":
        tag = "±10";
        break;
      case 16:
        tag = "hex";
        break;
      default:
        tag = String(viewType);
        break;
    }

    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "space-between";
    container.style.width = "100%";

    const textSpan = document.createElement("span");
    textSpan.className = "view-type-text";
    textSpan.textContent = tag;

    const iconSpan = document.createElement("span");
    iconSpan.className = "view-type-icon";
    iconSpan.style.cursor = "pointer";
    iconSpan.style.marginLeft = "4px";
    iconSpan.style.transform = 'translateY(4px)';
    iconSpan.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
    `;


    let activated = false;

    const openEditor = (e: PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!activated) {
        activated = true;

        // Set the cell as editable
        cell.getElement().dataset.allowEdit = "true";
        cell.edit();
        setTimeout(() => {
          activated = false;
        }, 300);
      }
    };

    container.addEventListener("pointerdown", openEditor);

    container.appendChild(textSpan);
    container.appendChild(iconSpan);

    return container;
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

  public  reInitializeTable(){
    this.table = this.initializeTable();
    this.initRegisterNames();
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
        editable: this.editableValue,
        cellMouseEnter: (e, cell) => {
          this.attachConvertionToggle(cell);
        }
      },
      {
        title: "",
        field: "viewType",
        visible: true,
        width: 60,
        headerSort: false,
        editor: "list", // Editor for the cell
        cellEdited: this.viewTypeEdited,
        editorParams: {
          values: this.possibleViews,
          allowEmpty: false,
          freetext: false
        },
        formatter: this.viewTypeFormatter,
        // Flag for allowing the cell to be edited
        editable: (cell: CellComponent): boolean => {
          return true;  // La celda siempre será editable
        }
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

      // 2 for binary, 16 for hexadecimal
      const viewType = (xname === 'x2') ? 16 : 2;
      tableData.push({
        name: `${xname} ${abi}`,
        rawName: `${xname}`,
        value: zeros32,
        viewType: viewType,
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
    const index = parseInt(name.substring(1), 10);


    const position = (index >= 0 && index <= 12) ? "center" : "top";

    this.table.scrollToRow(name, position, true);
  }


  private animateRegister(name: string) {
    const row = this.table.getRow(name);
    if (row) {
      const element = row.getElement();
      element.classList.add('animate-register');

      setTimeout(() => {
        element.classList.remove('animate-register');

      }, 500);
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
              cell.getElement().style.borderBottom = "0.5px solid gray";

            }
          } else {
            if ((field === "name" || field === "value") && cellValue.includes(lowerSearch)) {
              cell.getElement().style.backgroundColor = "#D1E3E7";
              cell.getElement().style.borderBottom = "0.5px solid gray";

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
        cell.getElement().style.borderBottom = "";

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


  private readonly attachConvertionToggle = (cell: CellComponent): void => {

    

    const cellElement = cell.getElement();
    let originalContent = cellElement.innerHTML;
  
    //Get the "viewType" cell and store its original content
    const viewTypeCell = cell.getRow().getCell("viewType");
    let originalViewTypeContent = viewTypeCell.getElement().innerHTML;
  
    let isConverted = false;
    let activeKey: string | null = null;
  
    // Keydown handler: applies conversion based on viewType and pressed key.
    const keyDownHandler = (evt: KeyboardEvent) => {
      if (isConverted) { return; }

      if (document.querySelector('input.register-editor') || document.querySelector('input.binary-editor')) {
        return; 
      }
    
  
      const data = cell.getData();
      const viewType = data.viewType;
      let newContent: string | null = null;
      let newViewTypeLabel: string | null = null; 
      const key = evt.key.toLowerCase();
  
      if (viewType === 2) {
        // Binary: 'd' shows decimal, 'h' shows hexadecimal.
        if (key === 'd') {
          const unsignedVal = binaryToUInt(data.value);
          const signedVal = binaryToInt(data.value);
          if (unsignedVal.toString() === signedVal.toString()) {
            newContent = signedVal.toString();
          } else {
            newContent = `${signedVal} / ${unsignedVal}`;
          }
          //Temporarily show "±10" for decimal
          newViewTypeLabel = "±10";
          activeKey = 'd';
        } else if (key === 'h') {
          newContent = binaryToHex(data.value);
          newViewTypeLabel = "hex"; 
          activeKey = 'h';
        }
      } else if (viewType === 'signed' || viewType === 'unsigned') {
        // Decimal: 'h' shows hexadecimal, 'b' shows 32-bit binary.
        if (key === 'h') {
          newContent = binaryToHex(data.value);
          newViewTypeLabel = "hex"; 
          activeKey = 'h';
        } else if (key === 'b') {
          newContent = binaryRepresentation(data.value);
          newViewTypeLabel = "bin"; 
          activeKey = 'b';
        }
      } else if (viewType === 16) {
        // Hexadecimal: 'd' shows decimal, 'b' shows 32-bit binary.
        if (key === 'd') {
          // Calculate both unsigned and signed decimals.
          const unsignedVal = binaryToUInt(data.value);
          const signedVal = binaryToInt(data.value);
          // Show both if different; otherwise, show one.
          if (unsignedVal.toString() === signedVal.toString()) {
            newContent = signedVal.toString();
          } else {
            newContent = `${signedVal} / ${unsignedVal}`;
          }
          //Temporarily show "±10" for decimal
          newViewTypeLabel = "±10";
          activeKey = 'd';
        } else if (key === 'b') {
          newContent = binaryRepresentation(data.value);
          newViewTypeLabel = "bin"; 
          activeKey = 'b';
        }
      }
  
      if (newContent !== null) {
        isConverted = true;
        // Update the cell content with the converted value
        cellElement.innerHTML = newContent;
  
        //Update the "viewType" cell if we have a new label
        if (newViewTypeLabel !== null) {
          viewTypeCell.getElement().innerHTML = newViewTypeLabel;
        }
      }
    };
  
    // Keyup handler: restores the original content when the conversion key is released.
    const keyUpHandler = (evt: KeyboardEvent) => {
      if (isConverted) {
        isConverted = false;
        activeKey = null;
        cellElement.innerHTML = originalContent;
        viewTypeCell.getElement().innerHTML = originalViewTypeContent;
        cell.getRow().reformat();
      }
    };
    
  
    // On mouse enter, add the key event listeners.
    cellElement.addEventListener('mouseenter', () => {
      // Update original contents in case the cell was reformatted
      originalContent = cellElement.innerHTML;
      //Also update the original "viewType" content
      originalViewTypeContent = viewTypeCell.getElement().innerHTML;
  
      document.addEventListener('keydown', keyDownHandler);
      document.addEventListener('keyup', keyUpHandler);
    });
  
    // On mouse leave, remove the listeners and restore the original content.
    cellElement.addEventListener('mouseleave', () => {
      document.removeEventListener('keydown', keyDownHandler);
      document.removeEventListener('keyup', keyUpHandler);
  
      if (isConverted) {
        isConverted = false;
        activeKey = null;
        cellElement.innerHTML = originalContent;
        //Restore the original "viewType" content
        viewTypeCell.getElement().innerHTML = originalViewTypeContent;
      }
    });
  };
  
  

}
