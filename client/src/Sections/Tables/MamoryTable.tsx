import { useEffect, useRef } from 'react';
import { useRoutes } from '@/context/RoutesContext';
import { 
  TabulatorFull as Tabulator, 
  ColumnDefinition, 
  CellComponent, 
  RowComponent 
} from 'tabulator-tables';
import './tabulator.min.css';
import { intToHex, binaryToHex } from '@/utils/tables/handlerConversions';
import { chunk } from 'lodash';

// Definición de tipos para la data del contexto
interface SymbolData {
  memdef: number;
  name: string;
}

interface DataMemoryTable {
  memory: string[];
  codeSize: number;
  symbols: Record<string, SymbolData>;
}

export interface MemoryRow {
  index?: number;
  address: string;
  value0: string;
  value1: string;
  value2: string;
  value3: string;
  info: string;
  hex: string;
}

// Definición de la interfaz del contexto
interface RoutesContextProps {
  dataMemoryTable: DataMemoryTable;
  sendMessagetoExtension: (msg: { command: string; object: { event: string; value: MemoryRow[] } }) => void;
}

const MemoryTable = () => {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  // TabulatorFull no es genérico, por lo que no se especifica tipo en useRef
  const tableInstanceRef = useRef<Tabulator | null>(null);

  // Obtenemos el contexto y lo casteamos primero a unknown para luego convertirlo a nuestro tipo
  const context = useRoutes() as unknown as RoutesContextProps;
  const { dataMemoryTable, sendMessagetoExtension } = context;
  console.log(dataMemoryTable.memory, dataMemoryTable.codeSize, dataMemoryTable.symbols);

  /* Funciones extras (ajústalas a tu lógica real) */
  const showHexadecimalInMemory = (): void => {
    console.log('Mostrando valores hexadecimales en la memoria');
  };

  const assignMemoryInputValue = (value: number): void => {
    console.log('Asignando valor al input de memoria:', value);
  };

  const configuration = (): void => {
    console.log('Realizando configuración adicional');
  };

  /* Función uploadMemory: actualiza (o crea) las filas de la tabla usando la data recibida */
  const uploadMemory = (newMemory: string[], newCodeSize: number, newSymbols: Record<string, SymbolData>): void => {
    // Divide la memoria en "palabras" de 4 bytes
    chunk(newMemory, 4).forEach((word: string[], index: number) => {
      const address = intToHex(index * 4).toUpperCase();
      const hex = word
        .slice()
        .reverse()
        .map((byte: string) => binaryToHex(byte).toUpperCase().padStart(2, '0'))
        .join('-');
      tableInstanceRef.current?.updateOrAddRow(address, {
        address,
        value0: word[0],
        value1: word[2],
        value2: word[1],
        value3: word[3],
        info: '',
        hex,
      });
      // Si la dirección está dentro del área de código, colorea la fila
      const row = tableInstanceRef.current?.getRow(address);
      if (row) {
        row.getElement().style.backgroundColor = '#FFF6E5';
      }
    });

    // Actualiza la fila de "Heap" usando el codeSize
    const heapAddressHex = intToHex(newCodeSize).toUpperCase();
    tableInstanceRef.current?.updateOrAddRow(heapAddressHex, {
      address: heapAddressHex,
      value0: '00000000',
      value1: '00000000',
      value2: '00000000',
      value3: '00000000',
      info: `<span class="info-column-mem-table">Heap</span>`,
      hex: '00-00-00-00',
    });

    // Etiqueta los símbolos en la tabla
    Object.values(newSymbols).forEach((symbol: SymbolData) => {
      const memdefHex = intToHex(symbol.memdef).toUpperCase();
      tableInstanceRef.current?.updateOrAddRow(memdefHex, {
        address: memdefHex,
        value0: '00000000',
        value1: '00000000',
        value2: '00000000',
        value3: '00000000',
        info: `<span class="info-column-mem-table">${symbol.name}</span>`,
        hex: '00-00-00-00',
      });
    });

    // Actualiza el PC (por defecto 0)
    updatePC(0);
  };

  /* Función para editar valores binarios */
  const binaryMemEditor = (
    cell: CellComponent,
    onRendered: (cb: () => void) => void,
    success: (value: string) => void,
    cancel: (restore?: boolean) => void
  ): HTMLInputElement => {
    const editor = document.createElement('input');
    editor.className = 'binary-editor';
    editor.value = cell.getValue() as string;
    editor.maxLength = 8;
    onRendered(() => {
      editor.focus();
      editor.select();
    });
    const formatValue = (value: string): string => value.padStart(8, '0').slice(0, 8);
    const commitEdit = () => {
      const rawValue = editor.value.replace(/[^01]/g, '');
      const formattedValue = formatValue(rawValue);
      editor.value = formattedValue;
      success(formattedValue);
    };
    editor.addEventListener('input', () => {
      editor.value = editor.value.replace(/[^01]/g, '');
    });
    editor.addEventListener('blur', commitEdit);
    editor.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') commitEdit();
      if (e.key === 'Escape') cancel();
    });
    return editor;
  };

  const getColumnDefinitions = (): ColumnDefinition[] => {
    const defaultAttrs: ColumnDefinition = {
      title: '',
      visible: true,
      headerSort: false,
      headerHozAlign: 'center',
      formatter: 'html',
    };

    const frozenAttrs: ColumnDefinition = { ...defaultAttrs, frozen: true };

    const editableAttrs: ColumnDefinition = {
      ...frozenAttrs,
      editor: binaryMemEditor,
      editable: true,
      cellMouseEnter: (_e, cell) => attachMemoryConversionToggle(cell),
    };

    return [
      { ...defaultAttrs, visible: false, field: 'index' },
      {
        ...frozenAttrs,
        title: 'Info',
        field: 'info',
        width: 60,
        formatter: (cell) => `<span class="truncated-info">${cell.getValue()}</span>`,
        // Se devuelve un string desde createTooltip (outerHTML)
        tooltip: (e: MouseEvent, cell: CellComponent, onRendered: (cb: () => void) => void): string =>
          createTooltip(e, cell, onRendered),
      },
      {
        ...frozenAttrs,
        title: 'Addr.',
        field: 'address',
        sorter: (a: string, b: string) => parseInt(a, 16) - parseInt(b, 16),
        headerSort: true,
        width: 75,
        formatter: (cell) => `<span class="address-value">${(cell.getValue() as string).toUpperCase()}</span>`,
        cellMouseEnter: (_e, cell) => attachMemoryConversionToggle(cell),
      },
      { ...editableAttrs, title: '0x3', field: 'value3', width: 83 },
      { ...editableAttrs, title: '0x2', field: 'value2', width: 83 },
      { ...editableAttrs, title: '0x1', field: 'value1', width: 83 },
      { ...editableAttrs, title: '0x0', field: 'value0', width: 83 },
      { ...frozenAttrs, title: 'HEX', field: 'hex', width: 100 },
    ];
  };

  // La función createTooltip devuelve el outerHTML del tooltip
  const createTooltip = (
    e: MouseEvent,
    cell: CellComponent,
    onRendered: (cb: () => void) => void
  ): string => {
    const value = cell.getValue() as string;
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.innerHTML = value;
    onRendered(() => {
      tooltip.style.position = 'absolute';
      tooltip.style.left = `${e.clientX + 17}px`;
      tooltip.style.top = `${e.clientY - 22}px`;
      document.body.appendChild(tooltip);
    });
    return tooltip.outerHTML;
  };

  const attachMemoryConversionToggle = (cell: CellComponent): void => {
    const cellElement = cell.getElement();
    const isAddressField = cell.getField() === 'address';
    const valueElement = isAddressField ? cellElement.querySelector('.address-value') : cellElement;
    const originalContent = valueElement ? valueElement.innerHTML : cellElement.innerHTML;
    let isConverted = false;
    let activeKey: string | null = null;

    const handleKeyDown = (evt: KeyboardEvent): void => {
      if (
        isConverted ||
        document.querySelector('input.binary-editor') ||
        document.querySelector('input.register-editor')
      ) {
        return;
      }
      const cellValue = cell.getValue() as string;
      let newContent: string | null = null;
      const key = evt.key.toLowerCase();
      if (isAddressField) {
        if (key === 'd') { newContent = parseInt(cellValue, 16).toString(); activeKey = 'd'; }
        else if (key === 'b') { newContent = parseInt(cellValue, 16).toString(2); activeKey = 'b'; }
      } else if (cell.getField().startsWith('value')) {
        if (key === 'd') { newContent = parseInt(cellValue, 2).toString(); activeKey = 'd'; }
        else if (key === 'h') { newContent = parseInt(cellValue, 2).toString(16).toUpperCase(); activeKey = 'h'; }
      }
      if (newContent && valueElement) {
        isConverted = true;
        valueElement.innerHTML = newContent;
      }
    };

    const handleKeyUp = (evt: KeyboardEvent): void => {
      if (activeKey && evt.key.toLowerCase() === activeKey && isConverted && valueElement) {
        isConverted = false;
        activeKey = null;
        valueElement.innerHTML = originalContent;
      }
    };

    const addListeners = (): void => {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keyup', handleKeyUp);
    };

    const removeListeners = (): void => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      if (isConverted && valueElement) {
        isConverted = false;
        activeKey = null;
        valueElement.innerHTML = originalContent;
      }
    };

    cellElement.addEventListener('mouseenter', addListeners);
    cellElement.addEventListener('mouseleave', removeListeners);
  };

  const updateHexValue = (row: RowComponent): void => {
    const rowData = row.getData() as MemoryRow;
    const fields: (keyof MemoryRow)[] = ['value3', 'value2', 'value1', 'value0'];
    const hexValue = fields
      .map(field => {
        const valueStr = rowData[field] !== undefined ? String(rowData[field]) : '0';
        return parseInt(valueStr, 2).toString(16).padStart(2, '0');
      })
      .join('-');
    row.update({ hex: hexValue });
  };
  
  const setupEventListeners = (): void => {
    tableInstanceRef.current?.on('cellEdited', (cell: CellComponent) => {
      if (cell.getField().startsWith('value')) {
        updateHexValue(cell.getRow());
        const currentData = tableInstanceRef.current!.getData() as MemoryRow[];
        const msg = {
          command: 'event',
          object: { event: 'memoryChanged', value: currentData },
        };
        sendMessagetoExtension(msg);
      }
    });
  };

  const updatePC = (newPC: number): void => {
    document.querySelectorAll('.pc-icon').forEach((icon) => icon.remove());
    const targetValue = (newPC * 4).toString(16).toUpperCase();
    const foundRows = tableInstanceRef.current?.searchRows('address', '=', targetValue) || [];
    if (foundRows.length === 0) return;
    const cell = foundRows[0].getCell('address');
    if (!cell) return;
    const cellElement = cell.getElement();
    cellElement.appendChild(createPCIcon());
    cellElement.classList.add('animate-pc');
    void cellElement.offsetWidth; // Forzar reflow para animación
    setTimeout(() => cellElement.classList.remove('animate-pc'), 500);
  };

  const createPCIcon = (): HTMLElement => {
    const icon = document.createElement('span');
    icon.className = 'pc-icon';
    icon.style.position = 'absolute';
    icon.style.top = '51%';
    icon.style.right = '5px';
    icon.style.transform = 'translateY(-50%)';
    icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                         fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"
                         class="lucide lucide-locate">
                         <line x1="2" x2="5" y1="12" y2="12"></line>
                         <line x1="19" x2="22" y1="12" y2="12"></line>
                         <line x1="12" x2="12" y1="2" y2="5"></line>
                         <line x1="12" x2="12" y1="19" y2="22"></line>
                         <circle cx="12" cy="12" r="7"></circle>
                       </svg>`;
    return icon;
  };

  // Inicializa la tabla; se crea la instancia de Tabulator sin data.
  useEffect(() => {
    if (!tableContainerRef.current) return;
    if (!tableInstanceRef.current) {
      tableInstanceRef.current = new Tabulator(tableContainerRef.current, {
        layout: 'fitColumns',
        index: 'address',
        data: [],
        columns: getColumnDefinitions(),
        initialSort: [{ column: 'address', dir: 'desc' }],
      });
      tableInstanceRef.current.on('tableBuilt', () => {
        if (dataMemoryTable) {
          showHexadecimalInMemory();
          assignMemoryInputValue(dataMemoryTable.memory.length - dataMemoryTable.codeSize);
          configuration();
          uploadMemory(dataMemoryTable.memory, dataMemoryTable.codeSize, dataMemoryTable.symbols);
          setupEventListeners();
        }
      });
    } else {
      if (dataMemoryTable) {
        uploadMemory(dataMemoryTable.memory, dataMemoryTable.codeSize, dataMemoryTable.symbols);
      }
    }
  }, [dataMemoryTable]);

  useEffect(() => {
    return () => {
      tableInstanceRef.current?.destroy();
    };
  }, []);

  return (
    <div className="shadow-lg max-h-dvh">
      <div ref={tableContainerRef} className="w-full h-full overflow-y-scroll overflow-x-hidden" />
    </div>
  );
};

export default MemoryTable;
