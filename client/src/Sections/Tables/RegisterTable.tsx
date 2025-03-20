import { useEffect, useRef, useState } from 'react';
import { TabulatorFull as Tabulator, CellComponent } from 'tabulator-tables';
import './tabulator.min.css';

import { registersNames } from '@/utils/tables/data';
import { RegisterView } from '@/utils/tables/types';
import { createViewTypeFormatter, handleGlobalKeyPress } from '@/utils/tables/handlersRegisters';
import { getColumnsRegisterDefinitions } from '@/utils/tables/definitionsColumns';
import SkeletonRegisterTable from '@/components/Skeleton/SkeletonRegisterTable';

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
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const tabulatorInstance = useRef<Tabulator | null>(null);
  const currentHoveredViewTypeCell = useRef<CellComponent | null>(null);
  const [tableData, setTableData] = useState<RegisterValue[]>([]);
  const [tableBuilt, setTableBuilt] = useState(false);

  const viewTypeFormatterCustom = createViewTypeFormatter((cell) => {
    currentHoveredViewTypeCell.current = cell;
  });

  // --- GLOBAL KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const keyHandler = handleGlobalKeyPress(currentHoveredViewTypeCell);
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, []);

  // --- INITIAL DATA ---
  useEffect(() => {
    const initialData = registersNames.map((name, id) => ({
      name,
      rawName: name.split(' ')[0],
      value: '0'.repeat(32),
      viewType: (name.split(' ')[0] === 'x2' ? 16 : 2) as RegisterView,
      watched: false,
      modified: 0,
      id,
    }));
    setTableData(initialData);
  }, []);

  // --- TABULATOR INITIALIZATION ---
  useEffect(() => {
    if (!tableRef.current || tabulatorInstance.current) return;

    const initTabulator = () => {
      tabulatorInstance.current = new Tabulator(tableRef.current!, {
        data: tableData,
        columns: getColumnsRegisterDefinitions(viewTypeFormatterCustom),
        layout: 'fitColumns',
        renderVertical: 'virtual',
        reactiveData: true,
        groupBy: 'watched',
        groupValues: [[true, false]],
        groupHeader: (value, count) => 
          `${value ? 'Watched' : 'Unwatched'} (${count} registers)`,
        movableRows: true,
        index: 'rawName',
      });

      tabulatorInstance.current.on('tableBuilt', () => {
        console.log('Tabulator fully initialized');
        setTableBuilt(true);
      });
    };

    if (tableData.length > 0) {
      initTabulator();
    }

    return () => {
      if (tabulatorInstance.current) {
        tabulatorInstance.current.destroy();
        tabulatorInstance.current = null;
        setTableBuilt(false);
      }
    };
  }, [tableData, viewTypeFormatterCustom]);

  return (
    <div className="shadow-lg max-h-[calc(100dvh-2.3rem)]" ref={tableContainerRef}>
      {!tableBuilt && <SkeletonRegisterTable />}
      <div
        ref={tableRef}
        className={`w-full h-full ${tableBuilt ? 'visible' : 'invisible absolute'}`}
      />
    </div>
  );
};

export default RegistersTable;