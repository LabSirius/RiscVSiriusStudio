import { useEffect, useRef } from 'react';
import { useMemoryTable } from '@/context/MemoryTableContext';
import { useRegistersTable } from '@/context/RegisterTableContext';

import { TabulatorFull as Tabulator } from 'tabulator-tables';
import './tabulator.min.css';

import { uploadMemory, setupEventListeners, toggleHexColumn,  } from '@/utils/tables/handlersMemory';
import { intTo32BitBinary } from '@/utils/tables/handlerConversions';
import { getColumnMemoryDefinitions } from '@/utils/tables/definitions/definitionsColumns';
import { DataMemoryTable } from '@/utils/tables/types';

import SkeletonMemoryTable from '@/components/Skeleton/SkeletonMemoryTable';

import { sendMessage } from '@/components/Message/sendMessage';

import { MemoryRow } from '@/context/MemoryTableContext';

interface MemoryContextProps {
  isCreatedMemoryTable: boolean;
  setIsCreatedMemoryTable: (isCreated: boolean) => void;
  showHexadecimal: boolean;
  dataMemoryTable: DataMemoryTable;
  setDataMemoryTable: (data: DataMemoryTable) => void;
  sizeMemory: number;
  setSizeMemory: (size: number) => void;
  importMemory: MemoryRow[];
  setImportMemory: (importMemory: MemoryRow[]) => void;
}


const MemoryTable = () => {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const tableInstanceRef = useRef<Tabulator | null>(null);

  const context = useMemoryTable() as unknown as MemoryContextProps;
  const { isCreatedMemoryTable, setIsCreatedMemoryTable, showHexadecimal, dataMemoryTable, setDataMemoryTable, sizeMemory, importMemory, setImportMemory  } = context;

  const { setRegisterData, setRegisterWrite} = useRegistersTable();

  /**
   * Initialize Tabulator instance
   */
  useEffect(() => {
    if (!tableContainerRef.current || tableInstanceRef.current) return;

    tableInstanceRef.current = new Tabulator(tableContainerRef.current, {
      layout: 'fitColumns',
      index: 'address',
      data: [],
      columns: getColumnMemoryDefinitions(),
      initialSort: [{ column: 'address', dir: 'desc' }],
    });

    tableInstanceRef.current.on('tableBuilt', () => {
      if (dataMemoryTable) {
        uploadMemory(
          tableInstanceRef.current!,
          dataMemoryTable.memory,
          dataMemoryTable.codeSize,
          dataMemoryTable.symbols,
          0,
          () => {

            setIsCreatedMemoryTable(true);
            
          }
        );
        setupEventListeners(tableInstanceRef.current!);
      }
    });

    tableInstanceRef.current.on('cellEdited', (cell) => {
      if (cell.getField().startsWith("value")) {
       sendMessage({ event: "memoryChanged", data: { memory: tableInstanceRef.current?.getData() } });
      }
    });
    

  }, []);


  /*
  * Update memory table when size memory changes
  */
  useEffect(() => {
    if (tableInstanceRef.current && dataMemoryTable) {
      
      const newTotalSize = dataMemoryTable.codeSize + sizeMemory;
      let newMemory: string[] = [];

      if (newTotalSize < dataMemoryTable.memory.length) {
        newMemory = dataMemoryTable.memory.slice(0, newTotalSize);
      }
      else if (newTotalSize > dataMemoryTable.memory.length) {
        newMemory = [
          ...dataMemoryTable.memory,
          ...new Array(newTotalSize - dataMemoryTable.memory.length).fill('00000000')
        ];
      } else {
        newMemory = dataMemoryTable.memory;
      }

      uploadMemory(
        tableInstanceRef.current,
        newMemory,
        dataMemoryTable.codeSize,
        dataMemoryTable.symbols,
        0,
        () => {
         
          setRegisterData((prev) => {
            const newData = [...prev];
            newData[2] = intTo32BitBinary(newTotalSize - 4);
            return newData;
          });
          setRegisterWrite('x2');
        },
      );

      setDataMemoryTable({
        ...dataMemoryTable,
        memory: newMemory,
      });

      
      sendMessage({ event: "memorySizeChanged", data: { sizeMemory: newTotalSize-4} });
    }
  }, [sizeMemory]);


  /**
   * Update memory table when importMemory changes
   */
  useEffect(() => {

    console.log(tableInstanceRef.current?.getData());
    console.log(importMemory);
    if(importMemory.length === 0) return;
    const importMemoryUppercase = importMemory.map(row => ({
      ...row,
      address: row.address.toUpperCase(),
    }));
    tableInstanceRef.current?.updateData(importMemoryUppercase);
    setImportMemory([]);
    sendMessage({ event: "memoryChanged", data: { memory: tableInstanceRef.current?.getData() } });

  }, [importMemory, setImportMemory]);


  /**
   * Update memory table if hexadecimal column visibility changes
   */
  useEffect(() => {
    if (tableInstanceRef.current) {
      toggleHexColumn(tableInstanceRef.current, showHexadecimal);
    }
  }, [showHexadecimal]);

  
  useEffect(() => {
    return () => {
      tableInstanceRef.current?.destroy();
    };
  }, []);

  return (
    <div className={`shadow-lg  min-h-min ${showHexadecimal ? 'min-w-[34.8rem]' : ''} relative`}>
      {!isCreatedMemoryTable && <SkeletonMemoryTable />}
      <div
        ref={tableContainerRef}
        className={`w-full max-h-[calc(100dvh-2.3rem)] overflow-y-scroll overflow-x-hidden [&_.tabulator-header]:bg-gray-100 [&_.tabulator-group]:bg-blue-50 transition-opacity duration-300
          `}
      />
    </div>
  );
};

export default MemoryTable;
