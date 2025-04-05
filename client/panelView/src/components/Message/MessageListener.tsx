import { useEffect } from "react";
import { useOperation } from "@/context/panel/OperationContext";
import { useSection } from "@/context/panel/SectionContext";
import { useMemoryTable } from "@/context/panel/MemoryTableContext";
import { useRegistersTable } from "@/context/panel/RegisterTableContext";
import { useDialog } from "@/context/panel/DialogContext";
import { useLines } from "@/context/panel/LinesContext";

const MessageListener = () => {
  const { setTextProgram, setOperation, isFirstStep, setIsFirstStep, setClickInLine } = useOperation();
  const { setLineDecorationNumber } = useLines();
  const { setSection } = useSection();
  const { setDataMemoryTable, setSizeMemory, setNewPc, setWriteInMemory, setReadInMemory, setIsCreatedMemoryTable } = useMemoryTable();
  const { setWriteInRegister } = useRegistersTable();
  const { setDialog} = useDialog();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message?.from === "UIManager") {
        switch (message.operation) {
          case "textProgram":
            setTextProgram(message.textProgram);
          break
          case "uploadMemory":
            setDialog({ title: "Info", description: "Before executing the first instruction, you can change the simulation settings by clicking the corresponding icon in the drop-down menu." });
            setIsCreatedMemoryTable(false);
            setIsFirstStep(false);
            setOperation("uploadMemory");
            setSection("program");
            setDataMemoryTable(message.payload);
            setSizeMemory(message.payload.memory.length - message.payload.codeSize);
            break;
          case 'decorateLine': 
           setLineDecorationNumber(message.lineDecorationNumber);
          break
          case "step":
            setNewPc(message.pc);
            if (!isFirstStep) {
              setSection("program");
              setOperation("step");
              setIsFirstStep(true);
            }
            break;
          case "clickInLine":
            setClickInLine(message.lineNumber);
            break;
          case "setRegister":
            setWriteInRegister({ registerName: message.register, value: message.value });
            break;
          case "writeMemory":
            setWriteInMemory({ address: message.address, value: message.value, _length: message._length });
            break;
          case "readMemory":
            setReadInMemory({ address: message.address, value: "1", _length: message._length });
            break;
          case "stop":
            setDialog({ title: "Info", description: "The program has ended." });
            
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [
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

  return null;
};

export default MessageListener;
