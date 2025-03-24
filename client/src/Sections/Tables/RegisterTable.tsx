import { useEffect, useRef, useState, useMemo } from 'react';
import { TabulatorFull as Tabulator, CellComponent } from 'tabulator-tables';
import './tabulator.css';

import { useMemoryTable } from '@/context/MemoryTableContext';
import { useRegistersTable } from '@/context/RegisterTableContext';
import { useTheme } from "@/components/ui/theme/theme-provider"

import { getColumnsRegisterDefinitions } from '@/utils/tables/definitions/definitionsColumns';

import { registersNames } from '@/constants/data';
import { RegisterView } from '@/utils/tables/types';

import { createViewTypeFormatter, handleGlobalKeyPress, updateRegisterValue, filterTableData } from '@/utils/tables/handlersRegisters';
import { resetCellColors } from '@/utils/tables/handlersShared';

import SkeletonRegisterTable from '@/components/Skeleton/SkeletonRegisterTable';
import { sendMessage } from '@/components/Message/sendMessage';

const RegistersTable = () => {  
  const { theme } = useTheme()
  const { isCreatedMemoryTable } = useMemoryTable();
  const { registerData, setRegisterData, writeInRegister, setWriteInRegister, importRegister, setImportRegister, searchInRegisters } = useRegistersTable();
  
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

  useEffect(() => {

    if (!isCreatedMemoryTable) setRegisterData(Array(32).fill('0'.repeat(32)));

  }, [isCreatedMemoryTable])

  // --- GLOBAL KEYBOARD SHORTCUTS ---
  useEffect(() => {
    if (!tableBuilt) return;
    const keyHandler = handleGlobalKeyPress(currentHoveredViewTypeCell);
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, [tableBuilt]);

  // --- TABULATOR INITIALIZATION (se ejecuta solo una vez) ---
  useEffect(() => {
    if (!tableRef.current || tabulatorInstance.current) return;

    // Initial data
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
      updateRegisterValue(tabulatorInstance, writeInRegister.value, writeInRegister.registerName);
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
          sendMessage({ event: 'registersChanged', registers: newData });
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

  /* 
    * This useEffect updates the value of a register when the user writes a new value
  */
  useEffect(() => {
    if (writeInRegister.value === '' || !tableBuilt) {
      return;
    }
    updateRegisterValue(tabulatorInstance, writeInRegister.registerName, writeInRegister.value);
    setWriteInRegister({ registerName: '', value: '' });
  }, [writeInRegister, setWriteInRegister, tableBuilt]);

  // This useEffect updates the table when the importRegister state changes
  useEffect(() => {
    if (!tableBuilt || importRegister.length === 0) return;
    tabulatorInstance.current?.setData(importRegister);
    setImportRegister([]);
  }, [importRegister, setImportRegister, tableBuilt]);

  
  // This useEffect filters the table when the searchInRegisters state changes
  useEffect(() => {
    if (!tabulatorInstance.current || !tableBuilt) return;
    if (searchInRegisters.trim() === '') {
      tabulatorInstance.current.clearFilter(true);
      resetCellColors(tabulatorInstance.current);
    } else {
      filterTableData(searchInRegisters, tabulatorInstance.current);
    }
  }, [searchInRegisters, tableBuilt]);

  useEffect(() => {
    return () => {
      tabulatorInstance.current?.destroy();
      tabulatorInstance.current = null;
      setTableBuilt(false);
    };
  }, []);

  return (
    <div ref={tableContainerRef} className="shadow-lg max-h-[calc(100dvh-2.3rem)] min-w-[22.3rem] ">
      {!tableBuilt && <SkeletonRegisterTable />}
      {isCreatedMemoryTable && (
        <div ref={tableRef} className={`w-full h-full ${theme === "light" ? "theme-light" : "theme-dark"}`} />
      )}
    </div>
  );
};

export default RegistersTable;
