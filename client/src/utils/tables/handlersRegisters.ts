import { CellComponent } from 'tabulator-tables';

import { Tabulator } from 'tabulator-tables';

import { RegisterView } from '@/utils/tables/types';

import { RefObject } from 'react';


import { animateRegister } from '@/utils/tables/cells';

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
    container.className = "flex justify-between items-center w-full";
    const textSpan = document.createElement("span");
    textSpan.textContent = tag;
    const iconSpan = document.createElement("span");
    iconSpan.className = "cursor-pointer ml-1";
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