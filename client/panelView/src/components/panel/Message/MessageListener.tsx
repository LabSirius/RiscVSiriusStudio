import { useEffect } from "react";
import { useOperation } from "@/context/panel/OperationContext";
import { useSection } from "@/context/panel/SectionContext";
import { useMemoryTable } from "@/context/panel/MemoryTableContext";
import { useRegistersTable } from "@/context/panel/RegisterTableContext";
import { useError } from "@/context/panel/ErrorContext";

const MessageListener = () => {
  const { setOperation, isFirstStep, setIsFirstStep, setClickInLine } = useOperation();
  const { setSection } = useSection();
  const { setDataMemoryTable, setSizeMemory, setNewPc, setWriteInMemory, setReadInMemory, setIsCreatedMemoryTable } = useMemoryTable();
  const { setWriteInRegister } = useRegistersTable();
  const { setError} = useError();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message?.from === "UIManager") {
        switch (message.operation) {
          case "textProgram":
              console.log("PROGRAM  TEXT IN VIEW", message.textProgram)
          break
          case "uploadMemory":
            setIsCreatedMemoryTable(false);
            setIsFirstStep(false);
            setOperation("uploadMemory");
            setSection("settings");
            setDataMemoryTable(message.payload);
            setSizeMemory(message.payload.memory.length - message.payload.codeSize);
            break;
          case "step":
            setNewPc(message.pc);
            if (!isFirstStep) {
              setSection("search");
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
            setError({ title: "Info", description: "The program has ended." });
            
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
    setError,
    setIsCreatedMemoryTable,
  ]);

  return null;
};

export default MessageListener;
