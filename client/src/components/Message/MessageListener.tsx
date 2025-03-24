import { useTheme } from "@/components/ui/theme/theme-provider"
import { useEffect } from "react";
import { useOperation } from "@/context/OperationContext";
import { useSection } from "@/context/SectionContext";
import { useMemoryTable } from "@/context/MemoryTableContext";
import { useRegistersTable } from "@/context/RegisterTableContext";

const MessageListener = () => {
  const { setTheme } = useTheme()
  const { setOperation, isFirstStep, setIsFirstStep } = useOperation();
  const { setSection } = useSection();
  const { setDataMemoryTable, setSizeMemory, setCodeSize, setNewPc, setWriteInMemory, setReadInMemory, setIsCreatedMemoryTable } = useMemoryTable();
  const { setWriteInRegister } = useRegistersTable();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message?.from === "UIManager") {
        switch (message.operation) {
          case "theme":
            setTheme(message.theme);
          break;
          case "uploadMemory":
            setIsCreatedMemoryTable(false);
            setIsFirstStep(false);
            setOperation("uploadMemory");
            setSection("settings");
            setDataMemoryTable(message.payload);
            setSizeMemory(message.payload.memory.length - message.payload.codeSize);
            setCodeSize(message.payload.codeSize);
            break;
          case "step":
            setNewPc(message.pc);
            if (!isFirstStep) {
              setSection("search");
              setOperation("step");
              setIsFirstStep(true);
            }
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
    setCodeSize,
    setNewPc,
    setWriteInMemory,
    setReadInMemory,
    setWriteInRegister,
    setSection,
    isFirstStep,
    setIsFirstStep,
    setTheme
  ]);

  return null;
};

export default MessageListener;
