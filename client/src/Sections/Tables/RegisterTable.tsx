import { useEffect, useRef, useState, useMemo } from 'react';
import { TabulatorFull as Tabulator, CellComponent } from 'tabulator-tables';
import './tabulator.min.css';

import { useMemoryTable } from '@/context/MemoryTableContext';
import { useRegistersTable } from '@/context/RegisterTableContext';
import { registersNames } from '@/constants/data';
import { RegisterView } from '@/utils/tables/types';
import { createViewTypeFormatter, handleGlobalKeyPress, updateRegisterValue } from '@/utils/tables/handlersRegisters';
import { getColumnsRegisterDefinitions } from '@/utils/tables/definitions/definitionsColumns';
import SkeletonRegisterTable from '@/components/Skeleton/SkeletonRegisterTable';

const RegistersTable = () => {
  const { isCreatedMemoryTable } = useMemoryTable();
  const { registerData, registerWrite, setRegisterWrite } = useRegistersTable();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const tabulatorInstance = useRef<Tabulator | null>(null);
  const currentHoveredViewTypeCell = useRef<CellComponent | null>(null);
  const [tableBuilt, setTableBuilt] = useState(false);

  // 1. Memoizar la función para que no cambie en cada render
  const viewTypeFormatterCustom = useMemo(
    () =>
      createViewTypeFormatter((cell) => {
        currentHoveredViewTypeCell.current = cell;
      }),
    []
  );

  // --- GLOBAL KEYBOARD SHORTCUTS ---
  useEffect(() => {

    if(!tableContainerRef.current) return;
    const keyHandler = handleGlobalKeyPress(currentHoveredViewTypeCell);
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, []);

  // --- TABULATOR INITIALIZATION (se ejecuta solo una vez) ---
  useEffect(() => {
    if (!tableRef.current || tabulatorInstance.current) return;

    // Data inicial
    const initialData = registersNames.map((name, id) => ({
      name,
      rawName: name.split(' ')[0],
      value: registerData[id],
      viewType: (name.split(' ')[0] === 'x2' ? 16 : 2) as RegisterView,
      watched: false,
      modified: 0,
      id,
    }));

    tabulatorInstance.current = new Tabulator(tableRef.current, {
      data: initialData,
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
      setTableBuilt(true);
    });

    return () => {
      if (tabulatorInstance.current) {
        tabulatorInstance.current.destroy();
        tabulatorInstance.current = null;
        setTableBuilt(false);
      }
    };
  }, [isCreatedMemoryTable]);

  // Update register value
  useEffect(() => {
    if (!registerWrite || !tabulatorInstance.current) {
      return;
    }
    updateRegisterValue(tabulatorInstance, registerWrite, registerData);
    setRegisterWrite('');

  }, [ registerData]);

  return (
    <div
      ref={tableContainerRef}
      className="shadow-lg max-h-[calc(100dvh-2.3rem)] min-w-[22.3rem]"
    >
      {!tableBuilt && <SkeletonRegisterTable />}
      <div
        ref={tableRef}
        className={`w-full h-full `}
      />
    </div>
  );
};

export default RegistersTable;
