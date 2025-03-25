import { useEffect, useRef } from "react";
import { useMemoryTable } from "@/context/MemoryTableContext";
import { useRegistersTable } from "@/context/RegisterTableContext";
import { useOperation } from "@/context/OperationContext";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "./tabulator.css";

import { useTheme } from "@/components/ui/theme/theme-provider";

import {
  uploadMemory,
  setupEventListeners,
  updatePC,
  filterMemoryData,
  setSP,
  writeInMemoryCell,
  animateMemoryCell,
} from "@/utils/tables/handlersMemory";
import {
  intTo32BitBinary,
  intToHex,
  binaryToInt,
} from "@/utils/tables/handlerConversions";
import { getColumnMemoryDefinitions } from "@/utils/tables/definitions/definitionsColumns";

import SkeletonMemoryTable from "@/components/Skeleton/SkeletonMemoryTable";
import { sendMessage } from "@/components/Message/sendMessage";

const MemoryTable = () => {
  const { theme } = useTheme();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const tableInstanceRef = useRef<Tabulator | null>(null);

  const {
    isCreatedMemoryTable,
    setIsCreatedMemoryTable,
    dataMemoryTable,
    setDataMemoryTable,
    sizeMemory,
    sp,
    setSp,
    importMemory,
    setImportMemory,
    newPc,
    setNewPc,
    searchInMemory,
    writeInMemory,
    setWriteInMemory,
    readInMemory,
    setReadInMemory,
    locatePc,
    setLocatePc,
  } = useMemoryTable();

  const { writeInRegister, setWriteInRegister } = useRegistersTable();
  const { isFirstStep } = useOperation();
  const isFirstStepRef = useRef(isFirstStep);

  // Initialize the memory table regardless of dataMemoryTable so that the container is always rendered.
  // Then, in the "tableBuilt" event, mark the table as created and load the data (if available).
  useEffect(() => {
    if (!tableContainerRef.current || isCreatedMemoryTable) return;

    if (tableInstanceRef.current) {
      tableInstanceRef.current.destroy();
      tableInstanceRef.current = null;
    }

    tableInstanceRef.current = new Tabulator(tableContainerRef.current, {
      layout: "fitColumns",
      index: "address",
      data: [],
      columns: getColumnMemoryDefinitions(isFirstStepRef),
      initialSort: [{ column: "address", dir: "desc" }],
    });

    tableInstanceRef.current.on("tableBuilt", () => {
      // Mark the table as created to hide the Skeleton.
      setIsCreatedMemoryTable(true);
      // If dataMemoryTable is available, upload the data.
      if (dataMemoryTable) {
        uploadMemory(
          tableInstanceRef.current!,
          dataMemoryTable.memory,
          dataMemoryTable.codeSize,
          dataMemoryTable.symbols,
          0,
          theme,
          () => {
            setSp(intToHex(dataMemoryTable.memory.length - 4));
            setNewPc(0);
          }
        );
      }
      setupEventListeners(tableInstanceRef.current!);
    });

    tableInstanceRef.current.on("cellEdited", (cell) => {
      if (cell.getField().startsWith("value")) {
        sendMessage({ event: "memoryChanged", memory: tableInstanceRef.current?.getData() });
      }
    });
  }, [isCreatedMemoryTable]);

  // Update the memory table when the memory size changes.
  useEffect(() => {
    if (!isCreatedMemoryTable) return;
    if (tableInstanceRef.current && dataMemoryTable) {
      const newTotalSize = dataMemoryTable.codeSize + sizeMemory;
      let newMemory: string[] = [];

      if (newTotalSize < dataMemoryTable.memory.length) {
        newMemory = dataMemoryTable.memory.slice(0, newTotalSize);
      } else if (newTotalSize > dataMemoryTable.memory.length) {
        newMemory = [
          ...dataMemoryTable.memory,
          ...new Array(newTotalSize - dataMemoryTable.memory.length).fill("00000000"),
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
        theme,
        () => {
          setNewPc(0);
          setSp(intToHex(newTotalSize - 4));
          const newMemorySize = intTo32BitBinary(newTotalSize - 4);
          setWriteInRegister({ registerName: "x2", value: newMemorySize });
        }
      );

      setDataMemoryTable({
        ...dataMemoryTable,
        memory: newMemory,
      });

      sendMessage({ event: "memorySizeChanged", sizeMemory: newTotalSize - 4 });
    }
  }, [sizeMemory]);

  // Update the table when importMemory state changes.
  useEffect(() => {
    if (importMemory.length === 0 || !isCreatedMemoryTable) return;
    const importMemoryUppercase = importMemory.map((row) => ({
      ...row,
      address: row.address.toUpperCase(),
    }));
    tableInstanceRef.current?.updateData(importMemoryUppercase);
    setImportMemory([]);
    sendMessage({ event: "memoryChanged", memory: tableInstanceRef.current?.getData() });
  }, [importMemory, setImportMemory, isCreatedMemoryTable]);


  // This useEffect disable editor in the first step
  useEffect(() => {
    if(!isCreatedMemoryTable) return;
    isFirstStepRef.current = isFirstStep;
  },[isFirstStep, isCreatedMemoryTable]);

  // Update the program counter value in the table and show an error if the program has finished.
  useEffect(() => {
    if (!isCreatedMemoryTable) return;
    if (dataMemoryTable?.codeSize !== undefined) {
      if (!(newPc * 4 >= dataMemoryTable?.codeSize)) {
        updatePC(newPc, { current: tableInstanceRef.current });
      }
        
      
    }
  }, [newPc, isCreatedMemoryTable]);

  // Filter the memory data when the search input changes.
  useEffect(() => {
    if (!tableInstanceRef.current || !isCreatedMemoryTable || newPc === 0) return;
    filterMemoryData(searchInMemory, tableInstanceRef);
    updatePC(newPc, { current: tableInstanceRef.current });
  }, [searchInMemory, isCreatedMemoryTable]);

  // Update the stack pointer in the table when writeInRegister changes.
  useEffect(() => {
    if (writeInRegister.value === "" || !tableInstanceRef.current || !isCreatedMemoryTable) return;
    if (writeInRegister.registerName === "x2") {
      setSp(
        setSP(Number(binaryToInt(writeInRegister.value)), { current: tableInstanceRef.current }, sp)
      );
    }
  }, [writeInRegister, sp, setSp, isCreatedMemoryTable]);

  // Update the hexadecimal column when showHexadecimal changes.
  // useEffect(() => {
  //   if (tableInstanceRef.current && isCreatedMemoryTable) {
  //     toggleHexColumn(tableInstanceRef.current, showHexadecimal);
  //   }
  // }, [showHexadecimal, isCreatedMemoryTable]);

  // Update the memory cell when writeInMemory changes.
  useEffect(() => {
    if (!isCreatedMemoryTable || writeInMemory.value === "") return;
    writeInMemoryCell(
      tableInstanceRef.current,
      writeInMemory.address,
      writeInMemory._length,
      writeInMemory.value,
      theme
    );
    setWriteInMemory({ address: 0, _length: 0, value: "" });
  }, [writeInMemory, setWriteInMemory, isCreatedMemoryTable]);

  // Animate the memory cell when readInMemory changes.
  useEffect(() => {
    if (!isCreatedMemoryTable || readInMemory.value === "-1" || !tableInstanceRef.current) return;
    animateMemoryCell(tableInstanceRef.current, readInMemory.address, readInMemory._length, true);
    setReadInMemory({ address: 0, _length: 0, value: "-1" });
  }, [readInMemory, setReadInMemory, isCreatedMemoryTable]);

  // Scroll to locate the program counter.
  useEffect(() => {
    if (!isCreatedMemoryTable || !locatePc) return;
    const targetValue = (newPc * 4).toString(16).toUpperCase();
    tableInstanceRef.current?.scrollToRow(targetValue, "top", true);
    setLocatePc(false);
  }, [locatePc, setLocatePc, isCreatedMemoryTable]);

  return (
    <div className={`shadow-lg min-h-min "min-w-[34.8rem] relative`}>
 
      <div className= {`h-full w-full transition-opacity ease-in 9000  ${isCreatedMemoryTable ? 'opacity-100' : 'opacity-0'}`}> 
      <div
        ref={tableContainerRef}
        className={`w-full max-h-[calc(100dvh-2.3rem)] overflow-y-scroll overflow-x-hidden  ${
          theme === "light" ? "theme-light" : "theme-dark"
        }`}
      /></div>
      {!isCreatedMemoryTable && (
        <div className="absolute inset-0">
          <SkeletonMemoryTable />
        </div>
      )}
    </div>
  );
};

export default MemoryTable;