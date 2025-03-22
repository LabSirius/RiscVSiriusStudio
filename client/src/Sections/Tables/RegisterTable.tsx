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

import { sendMessage } from '@/components/Message/sendMessage';

const RegistersTable = () => {
  const { isCreatedMemoryTable } = useMemoryTable();
  const { registerData, setRegisterData, registerWrite, setRegisterWrite, importRegister, setImportRegister } = useRegistersTable();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const tabulatorInstance = useRef<Tabulator | null>(null);
  const currentHoveredViewTypeCell = useRef<CellComponent | null>(null);
  const [tableBuilt, setTableBuilt] = useState(false);

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

    tabulatorInstance.current.on('cellEdited', (cell) => {
      if (cell.getField() === 'value') {
        let { value } = cell.getData();
        const { id } = cell.getData();
        if (value.length < 32) {
          value = value.padStart(32, '0');
        }
        setRegisterData((prevData) => {
          const newData = [...prevData];
          newData[id] = value;
          sendMessage({ event: "registersChanged", data: { registers: newData } });
          return newData;
        });
      }
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

  }, [registerData]);


  useEffect(() => {
    if(importRegister.length === 0) return;

    tabulatorInstance.current?.setData(importRegister);
    setImportRegister([]);

  }, [importRegister, setImportRegister]);
  
  return (
    <div
      ref={tableContainerRef}
      className="shadow-lg max-h-[calc(100dvh-2.3rem)] min-w-[22.3rem]"
    >
      {!tableBuilt && <SkeletonRegisterTable />}
      {isCreatedMemoryTable &&<div
        ref={tableRef}
        className={`w-full h-full `}
      />}
    </div>
  );
};

export default RegistersTable;
