import { headerGrouping, registerNamesFormatter, valueFormatter, valueRegisterEditor, editableValue, viewTypeEdited, viewTypeFormatter } from './helpers';

import {
  CellComponent,
  ColumnDefinition,
  TabulatorFull as Tabulator
} from 'tabulator-tables';



import { registersNames, possibleViews } from './constants';


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
  private table: Tabulator;

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
      groupHeader: headerGrouping,
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
        editor: valueRegisterEditor,
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
    ];
  }

  private initRegisterNames() {
    let tableData = [] as Array<RegisterValue>;
    registersNames.forEach((e, idx) => {
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

  public setUpSearch(): void {
    const searchRegisterInput = document.getElementById('searchRegisterInput') as HTMLInputElement;

    searchRegisterInput.addEventListener('input', () => {
      const input = searchRegisterInput.value.trim();
      if (input === '') {
        this.table.clearFilter(true);
        this.resetCellColors();
        return;
      }
      this.filterTableData(input);
    });

    searchRegisterInput.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        searchRegisterInput.value = '';
        this.table.clearFilter(true);
        this.resetCellColors();
      }
    });
  }

  private filterTableData(searchInput: string): void {
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

  private resetCellColors(): void {
    this.table.getRows().forEach(row => {
      row.getCells().forEach(cell => {
        cell.getElement().style.backgroundColor = "";
      });
    });
  }


}


