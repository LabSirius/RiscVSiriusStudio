import { useEffect, useRef } from "react";
import { useSimulator } from "@/context/shared/SimulatorContext";
import { useMemoryTable } from "@/context/panel/MemoryTableContext";
import { useRegistersTable } from "@/context/panel/RegisterTableContext";
import { useDialog } from "@/context/panel/DialogContext";
import { useLines } from "@/context/panel/LinesContext";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";

export const useMessageListener = () => {
  const {
    setDataMemoryTable,
    setWriteInMemory,
    setSizeMemory,
    setReadInMemory,
    setIsCreatedMemoryTable,
  } = useMemoryTable();

  const {
    typeSimulator,
    setTypeSimulator,
    setTextProgram,
    setOperation,
    isFirstStep,
    setIsFirstStep,
    setSection,
    setNewPc,
    setIsEbreak,
  } = useSimulator();
  
  const { setWriteInRegister } = useRegistersTable();
  const { setCurrentInst, setCurrentResult } = useCurrentInst();
  const { setLineDecorationNumber, setClickInEditorLine } = useLines();
  const { setDialog } = useDialog();

  // --- 2. Logic to track the current simulator type ---
  // This ref tracks the latest simulator type without adding it as a dependency
  // to the main message listener effect, preventing unwanted re-registrations.
  const typeSimulatorRef = useRef(typeSimulator);
  useEffect(() => {
    typeSimulatorRef.current = typeSimulator;
  }, [typeSimulator]);


  // --- 3. Main message event listener effect ---
  // This effect sets up a global listener for messages from the parent window (e.g., VS Code extension).
  // It contains the central switch statement to handle all incoming operations.
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message?.from === "UIManager") {
        switch (message.operation) {
          case "simulatorType":
            setTypeSimulator(message.simulatorType);
            break;
          case "textProgram":
            setTextProgram(message.textProgram);
            break;
          case "uploadMemory":
            if (!(typeSimulator === "graphic")) {
              setDialog({
                title: "Configuration Info",
                description:
                  "Before executing the first instruction, you can change the simulation settings by clicking the corresponding icon in the drop-down menu.",
                stop: false,
              });
              setSection("settings");
            }
            setIsCreatedMemoryTable(false);
            setDataMemoryTable(message.payload);
            setSizeMemory(message.payload.memory.length - message.payload.codeSize);
            setIsFirstStep(false);
            setOperation("uploadMemory");
            break;
          case "decorateLine":
            setLineDecorationNumber(message.lineDecorationNumber);
            break;
          case "step":
            setNewPc(message.newPc);
            setCurrentInst(message.currentInst);
            if (message.currentInst.asm?.toLowerCase() === "ebreak") {
              setIsEbreak(true);
            }
            setCurrentResult(message.result);
            if (message.lineDecorationNumber !== undefined) {
              setLineDecorationNumber(message.lineDecorationNumber);
            } else {
              setLineDecorationNumber(-1);
            }
            if (!isFirstStep) {
              if (typeSimulatorRef.current === "graphic") {
                setSection("program");
              } else {
                setSection("search");
              }
              setOperation("step");
              setIsFirstStep(true);
            }
            break;
          case "clickInLine":
            setClickInEditorLine(message.lineNumber);
            break;
          case "setRegister":
            setWriteInRegister({ registerName: message.register, value: message.value });
            break;
          case "writeMemory":
            setWriteInMemory({
              address: message.address,
              value: message.value,
              _length: message._length,
            });
            break;
          case "readMemory":
            setReadInMemory({ address: message.address, value: "1", _length: message._length });
            break;
          case "stop":
            setDialog({ title: "Info", description: "The program has ended.", stop: true });
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [
    // The dependency array remains untouched, as requested.
    setOperation,
    setDataMemoryTable,
    setSizeMemory,
    setNewPc,
    setWriteInMemory,
    setReadInMemory,
    setWriteInRegister,
    setSection,
    isFirstStep,
    setIsFirstStep,
    setDialog,
    setIsCreatedMemoryTable,
  ]);

  // --- 4. Effect to show dialog on graphic simulator start ---
  // This effect runs when the simulator type changes to 'graphic'
  // to show an informational dialog.
  useEffect(() => {
    if (typeSimulator === "graphic") {
      setDialog({
        title: "Configuration Info",
        description:
          "Before executing the first instruction, you can change the simulation settings by clicking the corresponding icon in the drop-down menu.",
        stop: false,
      });
    }
  }, [typeSimulator, setSection, setOperation, setDialog]);

};