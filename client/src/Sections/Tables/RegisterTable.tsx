import { useEffect, useRef, useState } from 'react';
import { TabulatorFull as Tabulator, CellComponent } from 'tabulator-tables';
import './tabulator.min.css';


import { registersNames } from '@/utils/tables/data';

import { RegisterView } from '@/utils/tables/types';

import {  createViewTypeFormatter, handleGlobalKeyPress } from '@/utils/tables/handlersRegisters';

import { getColumnsRegisterDefinitions } from '@/utils/tables/definitionsColumns';

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

  const viewTypeFormatterCustom = createViewTypeFormatter((cell) => {
    currentHoveredViewTypeCell.current = cell;
  });
  
  // --- GLOBAL KEYBOARD SHORTCUTS TO CHANGE viewType ---
  useEffect(() => {
    const keyHandler = handleGlobalKeyPress(currentHoveredViewTypeCell);
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, []);

  // --- INITIALIZATION OF TABLE DATA ---
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

  // --- INITIALIZATION ON TABULATOR ---
  useEffect(() => {
    if (!tableRef.current || tableData.length === 0) return;
    if (!tabulatorInstance.current) {
      tabulatorInstance.current = new Tabulator(tableRef.current, {
        data: tableData,
        columns: getColumnsRegisterDefinitions(viewTypeFormatterCustom),
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
    <div className="shadow-lg max-h-[calc(100dvh-2.3rem)]   min-w-[22.3rem]">
      <div
        ref={tableRef}
        className="w-full h-full overflow-y-scroll overflow-x-hidden [&_.tabulator-header]:bg-gray-100 [&_.tabulator-group]:bg-blue-50"
      />
    </div>
  );
};

export default RegistersTable;
