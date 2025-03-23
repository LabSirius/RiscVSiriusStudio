import { useEffect, useRef } from 'react';
import { useMemoryTable } from '@/context/MemoryTableContext';
import { useRegistersTable } from '@/context/RegisterTableContext';
import { useError } from '@/context/ErrorContext';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import './tabulator.css';

import { 
  uploadMemory, 
  setupEventListeners, 
  toggleHexColumn,
  updatePC, 
  filterMemoryData, 
  setSP,
  writeInMemoryCell,
  animateMemoryCell
} from '@/utils/tables/handlersMemory';
import { intTo32BitBinary,intToHex, binaryToInt, hexToInt } from '@/utils/tables/handlerConversions';
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
    sp,
    setSp,
    importMemory,
    setImportMemory,
    newPc,
    searchInMemory,
    writeInMemory,
    setWriteInMemory,
    readInMemory,
    setReadInMemory
  } = useMemoryTable();

  const { writeInRegister, setWriteInRegister } = useRegistersTable();
  const { setError } = useError();

  /*
    This useEffect initializes the memory table
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
            setSp(intToHex(dataMemoryTable.memory.length - 4));
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

  /*
    This useEffect updates the memory table when the dataMemoryTable state changes
  */
  useEffect(() => {
    if(!isCreatedMemoryTable) return;
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
          setSp(intToHex(newTotalSize - 4));
          const newMemorySize = intTo32BitBinary(newTotalSize - 4);
          setWriteInRegister({registerName: 'x2', value: newMemorySize});
        }
      );

      setDataMemoryTable({
        ...dataMemoryTable,
        memory: newMemory,
      });

      sendMessage({ event: 'memorySizeChanged', sizeMemory: newTotalSize - 4 });
    }
  }, [sizeMemory]);

  /*
    This useEffect updates the memory table when the importMemory state changes
  */
  useEffect(() => {
    if (importMemory.length === 0 || !isCreatedMemoryTable) return;
    const importMemoryUppercase = importMemory.map((row) => ({
      ...row,
      address: row.address.toUpperCase(),
    }));
    tableInstanceRef.current?.updateData(importMemoryUppercase);
    setImportMemory([]);
    sendMessage({ event: 'memoryChanged', memory: tableInstanceRef.current?.getData() });
  }, [importMemory, setImportMemory, isCreatedMemoryTable]);

  /*
    This useEffect updates the memory table when the showHexadecimal state changes
  */
 
  /*
    This useEffect updates the program counter value in the memory table
  */
  useEffect(() => {
    if (!isCreatedMemoryTable) return
    updatePC(newPc, { current: tableInstanceRef.current });
  }, [newPc, isCreatedMemoryTable]);


  /*
    this useEffect updates the memory table when the search input changes
  */
  useEffect(() => {
    if (!tableInstanceRef.current || isCreatedMemoryTable) return;
    filterMemoryData(searchInMemory, tableInstanceRef.current);
  }, [searchInMemory, isCreatedMemoryTable]);


/* 
  This useEffect updates the stack pointer value in the memory table
*/
  useEffect(() => {
    if(writeInRegister.value === "" || !tableInstanceRef.current || !isCreatedMemoryTable) return;
    if(writeInRegister.registerName === "x2") {
      setSp(setSP(Number(binaryToInt(writeInRegister.value)), { current: tableInstanceRef.current }, sp));
    }

  }, [writeInRegister, sp, setSp, isCreatedMemoryTable]);


  /*
    This useEffect updates the memory table when the showHexadecimal state changes
  */
    useEffect(() => {
      if (tableInstanceRef.current && isCreatedMemoryTable) {
        toggleHexColumn(tableInstanceRef.current, showHexadecimal);
      }
    }, [showHexadecimal, isCreatedMemoryTable]);


  /*
    this useEffect checks if the stack pointer is trying to access the program code section
  */
  useEffect(() => {
    if (!isCreatedMemoryTable) return;
    if (dataMemoryTable?.codeSize !== undefined && Number(hexToInt(sp)) <= dataMemoryTable.codeSize) {
      setError({title: 'Error in memory', description: `The stack pointer attempted to access the program code section at address ${sp}`});
    }
  }, [sp, dataMemoryTable?.codeSize, setError, isCreatedMemoryTable]);



  /* 
    This useEffect updates the memory table when the writeInMemory
  */
  useEffect(() => {
    if (!isCreatedMemoryTable || writeInMemory.value === '' ) return;
      writeInMemoryCell(tableInstanceRef.current, writeInMemory.address, writeInMemory._length, writeInMemory.value);
      setWriteInMemory({address: 0, _length: 0, value: ''});
  }, [writeInMemory,setWriteInMemory, isCreatedMemoryTable]);

  /* 
    This useEffect animates the memory cell when the readInMemory
  */
  useEffect(() => {
    if (!isCreatedMemoryTable || readInMemory.value === '-1' || !tableInstanceRef.current ) return;
      animateMemoryCell(tableInstanceRef.current, readInMemory.address, readInMemory._length, true);
      setReadInMemory({address: 0, _length: 0, value: '-1'});
  }, [readInMemory,setReadInMemory, isCreatedMemoryTable]);



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
