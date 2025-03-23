import { useEffect, useRef } from 'react';
import { useMemoryTable } from '@/context/MemoryTableContext';
import { useRegistersTable } from '@/context/RegisterTableContext';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import './tabulator.css';

import { 
  uploadMemory, 
  setupEventListeners, 
  toggleHexColumn, 
  updatePC, 
  filterMemoryData 
} from '@/utils/tables/handlersMemory';
import { intTo32BitBinary } from '@/utils/tables/handlerConversions';
import { getColumnMemoryDefinitions } from '@/utils/tables/definitions/definitionsColumns';

import SkeletonMemoryTable from '@/components/Skeleton/SkeletonMemoryTable';
import { sendMessage } from '@/components/Message/sendMessage';

const MemoryTable = () => {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const tableInstanceRef = useRef<Tabulator | null>(null);

  const {
    isCreatedMemoryTable,
    setIsCreatedMemoryTable,
    showHexadecimal,
    dataMemoryTable,
    setDataMemoryTable,
    sizeMemory,
    importMemory,
    setImportMemory,
    newPc,
    searchInMemory,
  } = useMemoryTable();

  const { setRegisterData, setRegisterWrite } = useRegistersTable();

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
          dataMemoryTable.memory, // ahora TS conoce el tipo
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
      if (cell.getField().startsWith('value')) {
        sendMessage({ event: 'memoryChanged', memory: tableInstanceRef.current?.getData() });
      }
    });
  }, []);

  useEffect(() => {
    if (tableInstanceRef.current && dataMemoryTable) {
      const newTotalSize = dataMemoryTable.codeSize + sizeMemory;
      let newMemory: string[] = [];

      if (newTotalSize < dataMemoryTable.memory.length) {
        newMemory = dataMemoryTable.memory.slice(0, newTotalSize);
      } else if (newTotalSize > dataMemoryTable.memory.length) {
        newMemory = [
          ...dataMemoryTable.memory,
          ...new Array(newTotalSize - dataMemoryTable.memory.length).fill('00000000'),
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
        }
      );

      setDataMemoryTable({
        ...dataMemoryTable,
        memory: newMemory,
      });

      sendMessage({ event: 'memorySizeChanged', sizeMemory: newTotalSize - 4 });
    }
  }, [sizeMemory]);

  useEffect(() => {
    if (importMemory.length === 0) return;
    const importMemoryUppercase = importMemory.map((row) => ({
      ...row,
      address: row.address.toUpperCase(),
    }));
    tableInstanceRef.current?.updateData(importMemoryUppercase);
    setImportMemory([]);
    sendMessage({ event: 'memoryChanged', memory: tableInstanceRef.current?.getData() });
  }, [importMemory, setImportMemory]);

  useEffect(() => {
    if (tableInstanceRef.current) {
      toggleHexColumn(tableInstanceRef.current, showHexadecimal);
    }
  }, [showHexadecimal]);

  useEffect(() => {
    updatePC(newPc, { current: tableInstanceRef.current });
  }, [newPc]);

  useEffect(() => {
    if (!tableInstanceRef.current) return;
    filterMemoryData(searchInMemory, tableInstanceRef.current);
  }, [searchInMemory]);

  useEffect(() => {
    return () => {
      tableInstanceRef.current?.destroy();
    };
  }, []);

  return (
    <div className={`shadow-lg min-h-min ${showHexadecimal ? 'min-w-[34.8rem]' : ''} relative`}>
      {!isCreatedMemoryTable && <SkeletonMemoryTable />}
      <div
        ref={tableContainerRef}
        className={`w-full max-h-[calc(100dvh-2.3rem)] overflow-y-scroll overflow-x-hidden [&_.tabulator-header]:bg-gray-100 [&_.tabulator-group]:bg-blue-50 transition-opacity duration-300`}
      />
    </div>
  );
};

export default MemoryTable;
