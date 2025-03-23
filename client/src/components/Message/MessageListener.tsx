// MessageListener.tsx
import { useEffect } from "react";
import { useOperation } from "@/context/OperationContext";
import { useSection } from "@/context/SectionContext";
import { useMemoryTable } from "@/context/MemoryTableContext";
import { useRegistersTable } from "@/context/RegisterTableContext";
import { useError } from "@/context/ErrorContext";
import { intToHex } from "@/utils/tables/handlerConversions";

const MessageListener = () => {
  const { setOperation, isFirstStep, setIsFirstStep } = useOperation();
  const { setSection } = useSection();
  const { setDataMemoryTable, setSizeMemory, setCodeSize, setNewPc, setWriteInMemory, setReadInMemory } = useMemoryTable();
  const { setWriteInRegister } = useRegistersTable();
  const { setError } = useError();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message?.from === "UIManager") {
        switch (message.operation) {
          case "uploadMemory":
            setOperation("uploadMemory");
            setSection("settings");
            setDataMemoryTable(message.payload);
            setSizeMemory(message.payload.memory.length - message.payload.codeSize);
            setCodeSize(message.payload.codeSize);
            break;
          case "step":
            setNewPc(Number(intToHex(message.pc)));
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
          case "stop":
            setError({ title: "Info", description: "The program has finished." });
            setOperation("");
            setSection("convert");
            break;
          default:
            // Puedes manejar operaciones desconocidas aquí
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
    setError,
    setSection,
    isFirstStep,
    setIsFirstStep,
  ]);

  return null;
};

export default MessageListener;
