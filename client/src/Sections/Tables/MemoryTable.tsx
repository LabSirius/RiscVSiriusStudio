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
}

const MemoryTable = () => {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const tableInstanceRef = useRef<Tabulator | null>(null);
  const context = useMemoryTable() as unknown as MemoryContextProps;
  const { showHexadecimal, dataMemoryTable } = context;
  
  const [isLoading, setIsLoading] = useState(true);
  console.log(isLoading)

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
  }, [dataMemoryTable]);

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
    <div className={`shadow-lg max-h-[calc(100dvh-2.3rem)] ${showHexadecimal ? 'min-w-[34.8rem]' : ''} relative`}>

      {isLoading && <SkeletonMemoryTable />}
     
      <div
        ref={tableContainerRef}
        className={`w-full h-full overflow-y-scroll overflow-x-hidden [&_.tabulator-header]:bg-gray-100 [&_.tabulator-group]:bg-blue-50 `}
      />
    </div>
  );
};

export default MemoryTable;
