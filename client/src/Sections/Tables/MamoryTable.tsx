import { useEffect, useRef } from 'react';
import { useRoutes } from '@/context/RoutesContext';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import './tabulator.min.css';

import { uploadMemory, setupEventListeners, toggleHexColumn } from '@/utils/tables/handlersMemory';
import { getColumnMemoryDefinitions } from '@/utils/tables/definitionsColumns';
import {  DataMemoryTable } from '@/utils/tables/types';

import {  } from '@/utils/tables/handlersMemory';
import { useMemoryTable } from '@/context/MemoryTableContext';

interface RoutesContextProps {
  dataMemoryTable: DataMemoryTable;}

const MemoryTable = () => {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const tableInstanceRef = useRef<Tabulator | null>(null);
  const context = useRoutes() as unknown as RoutesContextProps;
  const { dataMemoryTable } = context;

  const { showHexadecimal} = useMemoryTable();
 

  /**
   * Initialize the table with the data from the context
   */
  useEffect(() => {
    if (!tableContainerRef.current) return;
    if (!tableInstanceRef.current) {
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
            0
          );
          setupEventListeners(tableInstanceRef.current!);
        }
      });
    }
  }, []); 

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
    <div className="shadow-lg max-h-[calc(100dvh-2.3rem)]">
      <div ref={tableContainerRef} className="w-full h-full overflow-y-scroll overflow-x-hidden [&_.tabulator-header]:bg-gray-100 [&_.tabulator-group]:bg-blue-50" />
    </div>
  );
};

export default MemoryTable;
