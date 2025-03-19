import { useEffect, useRef, useState } from 'react';
import { TabulatorFull as Tabulator, CellComponent } from 'tabulator-tables';
import './tabulator.min.css';
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
} from '@/utils/tables/conversions';

type RegisterView = 2 | 16 | 'signed' | 'unsigned' | 'ascii';

interface RegisterValue {
  name: string;
  rawName: string;
  value: string;
  viewType: RegisterView;
  watched: boolean;
  modified: number;
  id: number;
}

const RegistersTable = () => {
  const tableRef = useRef<HTMLDivElement>(null);
  const tabulatorInstance = useRef<Tabulator | null>(null);
  const currentHoveredViewTypeCell = useRef<CellComponent | null>(null);
  const [tableData, setTableData] = useState<RegisterValue[]>([]);

  const registersNames = [
    'x0 zero', 'x1 ra', 'x2 sp', 'x3 gp', 'x4 tp', 'x5 t0', 'x6 t1', 'x7 t2',
    'x8 s0', 'x9 s1', 'x10 a0', 'x11 a1', 'x12 a2', 'x13 a3', 'x14 a4', 'x15 a5',
    'x16 a6', 'x17 a7', 'x18 s2', 'x19 s3', 'x20 s4', 'x21 s5', 'x22 s6', 'x23 s7',
    'x24 s8', 'x25 s9', 'x26 s10', 'x27 s11', 'x28 t3', 'x29 t4', 'x30 t5', 'x31 t6'
  ];

  const possibleViews: RegisterView[] = [2, 'signed', 'unsigned', 16, 'ascii'];

  // --- FORMATTERS Y EDITORES ---

  // Formatter para el nombre (formato simple, sin tipografía extra)
  const registerNamesFormatter = (cell: CellComponent) => {
    const { name } = cell.getData();
    const [xname, abiname] = name.split(' ');
    return xname + ' (' + abiname + ')';
  };

  // Formatter para el valor según viewType
  const valueFormatter = (cell: CellComponent) => {
    const { value, viewType } = cell.getData();
    switch (viewType) {
      case 2: {
        const intValue = Number(binaryToInt(value));
        const binStr = binaryRepresentation(value);
        return intValue < 0 
  ? `<div class="font-mono text-slate-400"><span class="text-gray-600">${binStr}</span></div>` 
  : `<div class="font-mono ">${binStr}</div>`;

      }
      case 'signed': return binaryToInt(value);
      case 'unsigned': return binaryToUInt(value);
      case 16: return binaryToHex(value);
      case 'ascii': return binaryToAscii(value);
      default: return value;
    }
  };

  // Editor para la celda de valor (se conserva la lógica para binario de 32 bits fijos)
  const valueRegisterEditor = (
    cell: CellComponent,
    onRendered: (callback: () => void) => void,
    success: (value: string) => void,
    cancel: (value?: string) => void,
  ) => {
    const { value, viewType } = cell.getRow().getData();
    const editor = document.createElement('input');
    editor.className =
      'px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400';
    
    if(viewType === 2) {
      editor.value = value; 
    } else {
      editor.value = formatValueAsType(value, viewType);
    }
  
    const handleSubmit = () => {
      const newVal = editor.value;
      const valid = isValidAs(newVal, viewType);
      if (valid) {
        if(viewType === 2){
          success(newVal);
        } else {
          success(toBinary(newVal, viewType));
        }
      } else {
        editor.classList.add('border-red-500');
      }
    };
  
    onRendered(() => editor.focus());
  
    if(viewType === 2) {
      editor.addEventListener('keydown', (e) => {
        if(e.key === '0' || e.key === '1'){
          e.preventDefault();
          editor.value = editor.value.substring(1) + e.key;
        } else if(e.key === 'Backspace' || e.key === 'Delete'){
          e.preventDefault();
        } else if(e.key === 'Enter'){
          handleSubmit();
        } else if(e.key === 'Escape'){
          cancel();
        }
      });
    } else {
      editor.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSubmit();
        if (e.key === 'Escape') cancel();
      });
    }
  
    editor.addEventListener('blur', handleSubmit);
  
    return editor;
  };

  // Valida el valor según el tipo de vista
  const isValidAs = (value: string, valType: RegisterView) => {
    switch (valType) {
      case 2: return validBinary(value) && value.length === 32;
      case 'unsigned': return validUInt32(value);
      case 'signed': return validInt32(value);
      case 16: return validHex(value);
      case 'ascii': return validAscii(value);
      default: return false;
    }
  };

  // Formatea el valor para el editor (excepto binario se deja tal cual)
  const formatValueAsType = (value: string, type: RegisterView): string => {
    switch (type) {
      case 'unsigned': return binaryToUInt(value);
      case 'signed': return binaryToInt(value);
      case 16: return binaryToHex(value);
      case 'ascii': return binaryToAscii(value);
      default: return value;
    }
  };

  // Formatter para la columna "Type"
  const viewTypeFormatterCustom = (cell: CellComponent) => {
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
      currentHoveredViewTypeCell.current = cell;
    });
    container.addEventListener("mouseleave", () => {
      currentHoveredViewTypeCell.current = null;
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

  // --- FUNCIONALIDAD EXTRA (CONVERSIÓN TEMPORAL AL PASAR EL MOUSE) ---
  const attachConvertionToggle = (cell: CellComponent) => {
    const cellElement = cell.getElement();
    let originalContent = cellElement.innerHTML;
    const viewTypeCell = cell.getRow().getCell("viewType");
    let originalViewTypeContent = viewTypeCell.getElement().innerHTML;
    let isConverted = false;
    let activeKey: string | null = null;
  
    const keyDownHandler = (evt: KeyboardEvent) => {
      if (isConverted) return;
      if (
        document.querySelector('input.register-editor') ||
        document.querySelector('input.binary-editor')
      ) {
        return;
      }
      const data = cell.getData();
      const viewType = data.viewType;
      let newContent: string | null = null;
      let newViewTypeLabel: string | null = null;
      const key = evt.key.toLowerCase();
  
      if (viewType === 2) {
        if (key === 'd') {
          const unsignedVal = binaryToUInt(data.value);
          const signedVal = binaryToInt(data.value);
          newContent = (unsignedVal.toString() === signedVal.toString())
            ? signedVal.toString()
            : `${signedVal} / ${unsignedVal}`;
          newViewTypeLabel = "±10";
          activeKey = 'd';
        } else if (key === 'h') {
          newContent = binaryToHex(data.value);
          newViewTypeLabel = "hex";
          activeKey = 'h';
        }
      } else if (viewType === 'signed' || viewType === 'unsigned') {
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
        if (key === 'd') {
          const unsignedVal = binaryToUInt(data.value);
          const signedVal = binaryToInt(data.value);
          newContent = (unsignedVal.toString() === signedVal.toString())
            ? signedVal.toString()
            : `${signedVal} / ${unsignedVal}`;
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
        cellElement.innerHTML = newContent;
        if (newViewTypeLabel !== null) {
          viewTypeCell.getElement().innerHTML = newViewTypeLabel;
        }
      }
    };
  
    const keyUpHandler = (evt: KeyboardEvent) => {
      if (evt.key.toLowerCase() !== activeKey) return;
      if (isConverted) {
        isConverted = false;
        activeKey = null;
        cellElement.innerHTML = originalContent;
        viewTypeCell.getElement().innerHTML = originalViewTypeContent;
        cell.getRow().reformat();
      }
    };
  
    cellElement.addEventListener('mouseenter', () => {
      originalContent = cellElement.innerHTML;
      originalViewTypeContent = viewTypeCell.getElement().innerHTML;
      document.addEventListener('keydown', keyDownHandler);
      document.addEventListener('keyup', keyUpHandler);
    });
  
    cellElement.addEventListener('mouseleave', () => {
      document.removeEventListener('keydown', keyDownHandler);
      document.removeEventListener('keyup', keyUpHandler);
      if (isConverted) {
        isConverted = false;
        activeKey = null;
        cellElement.innerHTML = originalContent;
        viewTypeCell.getElement().innerHTML = originalViewTypeContent;
      }
    });
  };

  // --- ATAJOS GLOBALES DE TECLADO PARA CAMBIAR EL viewType ---
  useEffect(() => {
    const handleGlobalKeyPress = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const keyMap: Record<string, RegisterView> = {
        'b': 2, 's': 'signed', 'u': 'unsigned', 'h': 16, 'a': 'ascii'
      };
      if (currentHoveredViewTypeCell.current && keyMap[key]) {
        const row = currentHoveredViewTypeCell.current.getRow();
        row?.update({ viewType: keyMap[key] });
        row?.reformat();
      }
    };
    document.addEventListener('keydown', handleGlobalKeyPress);
    return () => document.removeEventListener('keydown', handleGlobalKeyPress);
  }, []);

  // --- INICIALIZACIÓN DE DATOS ---
  useEffect(() => {
    const initialData = registersNames.map((name, id) => {
      const [rawName] = name.split(' ');
      return {
        name,
        rawName,
        value: '0'.repeat(32),
        viewType: (rawName === 'x2' ? 16 : 2) as RegisterView,
        watched: false,
        modified: 0,
        id
      };
    });
    setTableData(initialData);
  }, []);

  // --- INICIALIZACIÓN DE TABULATOR ---
  useEffect(() => {
    if (!tableRef.current || tableData.length === 0) return;
    if (!tabulatorInstance.current) {
      tabulatorInstance.current = new Tabulator(tableRef.current, {
        data: tableData,
        columns: [
          {
            title: 'Name',
            field: 'name',
            frozen: true,
            width: 100,
            formatter: registerNamesFormatter,
            cellDblClick: (_, cell) => {
              const data = cell.getData();
              // Alterna inmediatamente la propiedad "watched"
              const updatedData = { ...data, watched: !data.watched };
              cell.getRow().update(updatedData);
              tabulatorInstance.current?.setGroupBy('watched');
            }
          },
          {
            title: 'Value',
            field: 'value',
            width: 160,
            formatter: valueFormatter,
            editor: valueRegisterEditor,
            editable: (cell) => cell.getData().name !== 'x0 zero',
            cssClass: 'font-mono',
            cellMouseEnter: (_, cell) => {
              attachConvertionToggle(cell);
            }
          },
          {
            title: "Type",
            field: "viewType",
            width: 80,
            editor: "list",
            editorParams: { values: possibleViews },
            formatter: viewTypeFormatterCustom,
            cellEdited: (cell) => cell.getRow().reformat(),
            editable: () => true,
          },
          { title: 'Watched', field: 'watched', visible: false }
        ],
        layout: 'fitColumns',
        reactiveData: true,
        groupBy: 'watched',
        groupValues: [[true, false]],
        groupHeader: (value, count) =>
          `${value ? 'Watched' : 'Unwatched'} (${count} registers)`,
        movableRows: true,
        index: 'rawName',
      });
    } else {
      tabulatorInstance.current.setData(tableData);
    }
  }, [tableData]);

  return (
    <div className="shadow-lg max-h-dvh">
      <div
        ref={tableRef}
        className="w-full h-full overflow-y-scroll overflow-x-hidden [&_.tabulator-header]:bg-gray-100 [&_.tabulator-group]:bg-blue-50"
      />
    </div>
  );
};

export default RegistersTable;
