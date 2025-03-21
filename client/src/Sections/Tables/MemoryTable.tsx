import { useEffect, useRef, useState } from 'react';
import { useMemoryTable } from '@/context/MemoryTableContext';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import './tabulator.min.css';

import { uploadMemory, setupEventListeners, toggleHexColumn } from '@/utils/tables/handlersMemory';
import { getColumnMemoryDefinitions } from '@/utils/tables/definitionsColumns';
import { DataMemoryTable } from '@/utils/tables/types';

import SkeletonMemoryTable from '@/components/Skeleton/SkeletonMemoryTable';

interface MemoryContextProps {
  showHexadecimal: boolean;
  dataMemoryTable: DataMemoryTable;
  setDataMemoryTable: (data: DataMemoryTable) => void;
  sizeMemory: number;
  setSizeMemory: (size: number) => void;
}


const MemoryTable = () => {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const tableInstanceRef = useRef<Tabulator | null>(null);
  const context = useMemoryTable() as unknown as MemoryContextProps;
  const { showHexadecimal, dataMemoryTable, setDataMemoryTable, sizeMemory } = context;
  
  const [isLoading, setIsLoading] = useState(true);


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
            setIsLoading(false);
          }
        );
        setupEventListeners(tableInstanceRef.current!);
      }
    });
  }, []);


  /*
  * Update memory table when size memory changes
  */
  useEffect(() => {
    if (tableInstanceRef.current && dataMemoryTable) {
      setIsLoading(true);
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
          setIsLoading(false);
        },
      );

      setDataMemoryTable({
        ...dataMemoryTable,
        memory: newMemory,
      });
    }
  }, [sizeMemory]);


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
      {isLoading && <SkeletonMemoryTable />}
      <div
        ref={tableContainerRef}
        className={`w-full max-h-[calc(100dvh-2.3rem)] overflow-y-scroll overflow-x-hidden [&_.tabulator-header]:bg-gray-100 [&_.tabulator-group]:bg-blue-50 transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  );
};

export default MemoryTable;
