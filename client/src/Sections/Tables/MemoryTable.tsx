import { useEffect, useRef, useState } from 'react';
import { useRoutes } from '@/context/RoutesContext';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import './tabulator.min.css';

import { uploadMemory, setupEventListeners, toggleHexColumn } from '@/utils/tables/handlersMemory';
import { getColumnMemoryDefinitions } from '@/utils/tables/definitionsColumns';
import { DataMemoryTable } from '@/utils/tables/types';
import { useMemoryTable } from '@/context/MemoryTableContext';

import SkeletonMemoryTable from '@/components/Skeleton/SkeletonMemoryTable';

interface RoutesContextProps {
  dataMemoryTable: DataMemoryTable;
}

const MemoryTable = () => {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const tableInstanceRef = useRef<Tabulator | null>(null);
  const context = useRoutes() as unknown as RoutesContextProps;
  const { dataMemoryTable } = context;
  const { showHexadecimal } = useMemoryTable();
  
  // Estado que controla si la tabla está cargada (visible) o no
  const [isLoading, setIsLoading] = useState(true);
  console.log(isLoading)

  // Inicializa Tabulator con un array vacío; luego uploadMemory lo actualizará
  useEffect(() => {
    if (!tableContainerRef.current || tableInstanceRef.current) return;

    tableInstanceRef.current = new Tabulator(tableContainerRef.current, {
      layout: 'fitColumns',
      index: 'address',
      data: [], // Arrancamos con array vacío
      columns: getColumnMemoryDefinitions(),
      initialSort: [{ column: 'address', dir: 'desc' }],
    });

    // Cuando se dispare 'tableBuilt', se ejecuta uploadMemory y luego se quita el skeleton
    tableInstanceRef.current.on('tableBuilt', () => {
      if (dataMemoryTable) {
        uploadMemory(
          tableInstanceRef.current!,
          dataMemoryTable.memory,
          dataMemoryTable.codeSize,
          dataMemoryTable.symbols,
          0,
          () => {
            // Callback que se ejecuta al finalizar uploadMemory:
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
    <div className="shadow-lg max-h-[calc(100dvh-2.3rem)] min-w-[34.8rem] relative">

      {isLoading && <SkeletonMemoryTable />}
     
      <div
        ref={tableContainerRef}
        className={`w-full h-full overflow-y-scroll overflow-x-hidden [&_.tabulator-header]:bg-gray-100 [&_.tabulator-group]:bg-blue-50 `}
      />
    </div>
  );
};

export default MemoryTable;
