// MessageListener.tsx
import { useEffect } from "react";
import { useOperation } from "@/context/OperationContext";
import { useMemoryTable } from "@/context/MemoryTableContext";


import { intToHex } from "@/utils/tables/handlerConversions";

const MessageListener = () => {
  const { setOperation,  isFirstStep, setIsFirstStep } = useOperation();
  const { setDataMemoryTable, setSizeMemory, setCodeSize, setNewPc } = useMemoryTable();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message?.from === "UIManager") {
        if (message.operation === 'uploadMemory') {
          setOperation('uploadMemory');
          setDataMemoryTable(message.payload);
          setSizeMemory(message.payload.memory.length - message.payload.codeSize );
          setCodeSize(message.payload.codeSize);
        }
        if(message.operation === 'step') {
          setNewPc(Number(intToHex(message.pc)));
          if(!isFirstStep) {
            setOperation('firstStep');
            setIsFirstStep(true);
          }
          else {
            setOperation('step');
          }
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [setOperation, setDataMemoryTable, setSizeMemory]);

  return null;
};

export default MessageListener;
