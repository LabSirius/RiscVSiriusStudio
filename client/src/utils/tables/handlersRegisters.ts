
import { Tabulator, CellComponent,RowComponent } from 'tabulator-tables';

import { RegisterView, RowData } from '@/utils/tables/types';

import { RefObject } from 'react';


import { animateRegister, resetCellColors } from '@/utils/tables/handlersShared';

 export function updateRegisterValue(
    tabulatorRef: React.MutableRefObject<Tabulator | null>,
    registerWrite: string,
    registerData: string[]
  ) {
    if (!registerWrite || !tabulatorRef.current) return;
  
    const regNum = parseInt(registerWrite.replace('x', ''), 10);
    if (isNaN(regNum)) return;
  
    tabulatorRef.current.updateData([
      { rawName: registerWrite, value: registerData[regNum] }
    ]);

    animateRegister(tabulatorRef, registerWrite);
  }


export const createViewTypeFormatter = (
  setCurrentHovered: (cell: CellComponent | null) => void
) => {
  return (cell: CellComponent) => {
    const { viewType } = cell.getData();
    let tag = "";
    switch (viewType) {
      case 2: tag = "bin"; break;
      case 'unsigned': tag = "10"; break;
      case 'signed': tag = "±10"; break;
      case 16: tag = "hex"; break;
      default: tag = String(viewType);
    }
    const container = document.createElement("div");
    container.className = "flex items-center justify-between w-full";
    const textSpan = document.createElement("span");
    textSpan.textContent = tag;
    const iconSpan = document.createElement("span");
    iconSpan.className = "ml-1 cursor-pointer";
    iconSpan.innerHTML = `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>`;
    container.appendChild(textSpan);
    container.appendChild(iconSpan);
    
    container.addEventListener("mouseenter", () => {
      setCurrentHovered(cell);
    });
    container.addEventListener("mouseleave", () => {
      setCurrentHovered(null);
    });
    
    let activated = false;
    container.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!activated) {
        activated = true;
        cell.getElement().dataset.allowEdit = "true";
        cell.edit();
        setTimeout(() => { activated = false; }, 300);
      }
    });
    
    return container;
  };
};


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleGlobalKeyPress = (currentHoveredViewTypeCell: RefObject<any>) => {
  return (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    const keyMap: Record<string, RegisterView> = {
      b: 2,
      s: "signed",
      u: "unsigned",
      h: 16,
      a: "ascii",
    };

    if (currentHoveredViewTypeCell.current && keyMap[key]) {
      const row = currentHoveredViewTypeCell.current.getRow();
      row?.update({ viewType: keyMap[key] });
      row?.reformat();
    }
  };
};



/**
 * This function filters the data in a Tabulator table based on the search input.
 * It also highlights the cells that contain the search input.
 * @param searchInput The search input
 * @param table The Tabulator table
 * @returns void
 */

export function filterTableData(searchInput: string, table: Tabulator): void {
  resetCellColors(table);

  if (searchInput.toLowerCase().startsWith('0x')) {
    const hexPart = searchInput.slice(2);
    const num = parseInt(hexPart, 16);
    const binaryHex = num.toString(2);

    table.setFilter((data: RowData) => {
      const valueStr = data.value?.toString().toLowerCase() || '';
      return valueStr.includes(binaryHex);
    });

    table.getRows().forEach((row: RowComponent) => {
      row.getCells().forEach((cell: CellComponent) => {
        if (cell.getField() === 'value') {
          const cellValue = cell.getValue()?.toString().toLowerCase() || '';
          if (cellValue.includes(binaryHex)) {
            cell.getElement().style.backgroundColor = '#D1E3E7';
          }
        }
      });
    });
  } else {
    const lowerSearch = searchInput.toLowerCase();
    let isNumeric = false;
    let candidateFromDecimal = '';
    let candidateFromUnsigned = '';

    if (/^[01]+$/.test(searchInput)) {
      isNumeric = true;
      candidateFromDecimal = searchInput.replace(/^0+/, '') || '0';
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

    table.setFilter((data: RowData) => {
      const nameStr = data.name?.toLowerCase() || '';
      const valueStr = data.value?.toString().toLowerCase() || '';
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

    table.getRows().forEach((row: RowComponent) => {
      row.getCells().forEach((cell: CellComponent) => {
        const field = cell.getField();
        const cellValue = cell.getValue()?.toString().toLowerCase() || '';
        if (isNumeric) {
          if (
            (field === 'name' || field === 'value') &&
            (cellValue.includes(lowerSearch) ||
              cellValue.includes(candidateFromDecimal) ||
              cellValue.includes(candidateFromUnsigned))
          ) {
            cell.getElement().style.backgroundColor = '#D1E3E7';
          }
        } else {
          if ((field === 'name' || field === 'value') && cellValue.includes(lowerSearch)) {
            cell.getElement().style.backgroundColor = '#D1E3E7';
          }
        }
      });
    });
  }
}

