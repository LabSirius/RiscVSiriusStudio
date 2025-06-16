import { useEffect, useRef, useState } from "react";
import { useMemoryTable } from "@/context/panel/MemoryTableContext";
import { useRegistersTable } from "@/context/panel/RegisterTableContext";
import { useSimulator } from "@/context/shared/SimulatorContext";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "./tabulator.css";

import { useTheme } from "@/components/panel/ui/theme/theme-provider";

import {
  uploadMemory,
  setupEventListeners,
  updatePC,
  filterMemoryData,
  setSP,
  writeInMemoryCell,
  animateMemoryCell,
  animateRow,
  animateArrowBetweenCells,
  createPCIcon,
} from "@/utils/tables/handlersMemory";
import {
  intTo32BitBinary,
  intToHex,
  binaryToInt,
  binaryToIntTwoComplement,
  hexToInt,
} from "@/utils/handlerConversions";
import { getColumnMemoryDefinitions } from "@/utils/tables/definitions/definitionsColumns";

import SkeletonMemoryTable from "@/components/panel/Skeleton/SkeletonMemoryTable";
import { sendMessage } from "@/components/Message/sendMessage";
import { useLines } from "@/context/panel/LinesContext";
import { ArrowBigLeftDash, ArrowBigRightDash } from "lucide-react";

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
    searchInMemory,
    writeInMemory,
    setWriteInMemory,
    readInMemory,
    setReadInMemory,
    locatePc,
    setLocatePc,
  } = useMemoryTable();

  const { newPc, setNewPc, isFirstStep } = useSimulator();
  const newPcRef = useRef(newPc);

  const { writeInRegister, setWriteInRegister } = useRegistersTable();
  const { clickInEditorLine, setClickInEditorLine, setClickAddressInMemoryTable } = useLines();
  const isFirstStepRef = useRef(isFirstStep);

  const [showTable, setShowTable] = useState(true);

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
      rowFormatter: function (row) {
        const data = row.getData();
        if (!dataMemoryTable) return;

        const spAddress = intToHex(dataMemoryTable.memory.length - 4).toUpperCase();
        if (data.address === spAddress) return;

        const rowEl = row.getElement();

        if (data.segment === "program") {
          rowEl.style.backgroundColor = "#D1E3E7"; // azul pastel
          rowEl.style.color = "#000";
        } else if (data.segment === "constants") {
          rowEl.style.backgroundColor = "#FFE5B4"; // naranja pastel
          rowEl.style.color = "#000";
        } else {
          rowEl.style.backgroundColor = "";
          rowEl.style.color = "";
        }

        const currentPcHex = (newPcRef.current * 4).toString(16).toUpperCase();
        if (data.address === currentPcHex ) {
          
          rowEl.querySelectorAll(".pc-icon").forEach((el) => el.remove());
          const cell = row.getCell("address");
          if (cell) {
            const cellEl = cell.getElement();
            cellEl.style.position = "relative";
            cellEl.appendChild(createPCIcon());
          }
        }
      },
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
          dataMemoryTable.constantsSize,
          dataMemoryTable.symbols,
          () => {
            setSp(intToHex(dataMemoryTable.memory.length - 4));
            setNewPc(0);
          }
        );
      }

      tableInstanceRef.current?.on("cellClick", (_, cell) => {
        if (cell.getField() === "address") {
          const address = cell.getValue();
          const intAdress = Number(hexToInt(address)) / 4;
          if (dataMemoryTable?.codeSize) {
            if (intAdress * 4 < dataMemoryTable?.codeSize) {
              const instruction = dataMemoryTable?.addressLine[intAdress];
              if (instruction) {
                setClickAddressInMemoryTable(instruction.line);
                sendMessage({ event: "clickInInstruction", line: instruction.line });
                if (dataMemoryTable?.addressLine[intAdress].jump) {
                  const intJump = Number(
                    binaryToIntTwoComplement(String(dataMemoryTable?.addressLine[intAdress].jump))
                  );
                  const jumpTo = intJump + intAdress * 4;
                  if (tableInstanceRef.current) {
                    animateArrowBetweenCells(tableInstanceRef.current, intAdress * 4, jumpTo);
                  }
                }
              }
            }
          }
        }
      });

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
        dataMemoryTable.constantsSize,
        dataMemoryTable.symbols,
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
    if (!isCreatedMemoryTable) return;
    isFirstStepRef.current = isFirstStep;
  }, [isFirstStep, isCreatedMemoryTable]);

  // Update the program counter value in the table and show an error if the program has finished.
  useEffect(() => {
    if (!isCreatedMemoryTable) return;
    if (dataMemoryTable?.codeSize !== undefined) {
        newPcRef.current = newPc;
      if (!(newPc * 4 >= dataMemoryTable?.codeSize - dataMemoryTable?.constantsSize)) {
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

  // Animate the memory cell when clickInEditorLine changes.
  useEffect(() => {
    if (!isCreatedMemoryTable || clickInEditorLine === -1) return;
    const position = dataMemoryTable?.addressLine.findIndex(
      (item) => item.line === clickInEditorLine
    );
    if (position !== -1) {
      if (tableInstanceRef.current && (position || position === 0)) {
        animateRow(tableInstanceRef.current, position * 4);
        if (dataMemoryTable?.addressLine[position].jump) {
          const intJump = Number(
            binaryToIntTwoComplement(String(dataMemoryTable?.addressLine[position].jump))
          );
          const jumpTo = intJump + position * 4;
          if (tableInstanceRef.current) {
            animateArrowBetweenCells(tableInstanceRef.current, position * 4, jumpTo);
          }
        }
      }
      setClickInEditorLine(-1);
    }
  }, [clickInEditorLine, setClickInEditorLine, isCreatedMemoryTable]);

  return (
    <>
      <div className={`shadow-lg !min-h-min min-w-[37.36rem] relative ${
          !showTable && "hidden"
        }`}>
        <div
          className={`h-full  w-full transition-opacity ease-in 9000  ${
            isCreatedMemoryTable ? "opacity-100" : "opacity-0"
          }`}>
          <div
            ref={tableContainerRef}
            className={`w-full h-full overflow-x-hidden ${
              theme === "light" ? "theme-light" : "theme-dark"
            }`}
          />
          <ArrowBigLeftDash
            onClick={() => {setShowTable(false)
              
              
            }}
            size={18}
            strokeWidth={1.5}
            className="absolute cursor-pointer right-[.13rem] top-[.4rem] z-100 text-black"
          />
        </div>
        {!isCreatedMemoryTable && (
          <div className="absolute inset-0">
            <SkeletonMemoryTable />
          </div>
        )}
      </div>
        {!showTable && (
        <div
          onClick={() => setShowTable(true)}
          className="h-full w-[1.6rem] cursor-pointer z-100 bg-[#2E2E2E] b-1 border-black rounded-[.3rem] flex flex-col items-center uppercase group">
          <ArrowBigRightDash
            size={18}
            strokeWidth={1.5}
            className="text-gray-400  mt-[0.35rem] mb-3 transition ease-in-out group-hover:text-gray-300"
          />
          {"memory".split("").map((char, index) => (
            <span key={index} className="text-[.65rem] font-bold text-gray-500 leading-[1.15rem] transition ease-in-out group-hover:text-gray-400">
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </div>
      )}
    </>
  );
};

export default MemoryTable;
