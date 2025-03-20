import { useEffect, useRef, useState } from 'react';
import { TabulatorFull as Tabulator, CellComponent } from 'tabulator-tables';
import './tabulator.min.css';


import { registersNames } from '@/utils/tables/data';

import { RegisterView } from '@/utils/tables/types';

import { registerNamesFormatter, valueFormatter, valueRegisterEditor, attachConvertionToggle, createViewTypeFormatter } from '@/utils/tables/handlers';

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


  const possibleViews: RegisterView[] = [2, 'signed', 'unsigned', 16, 'ascii'];

  const viewTypeFormatterCustom = createViewTypeFormatter((cell) => {
    currentHoveredViewTypeCell.current = cell;
  });
  
  // --- GLOBAL KEYBOARD SHORTCUTS TO CHANGE viewType ---
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

  // --- INICIALIZACIÓN DE DATOS ---jh 
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
