// MessageListener.tsx
import { useEffect } from "react";
import { useOperation } from "@/context/OperationContext";
import { useSection } from "@/context/SectionContext";

import { useMemoryTable } from "@/context/MemoryTableContext";

import { intToHex } from "@/utils/tables/handlerConversions";
import { useRegistersTable } from "@/context/RegisterTableContext";

const MessageListener = () => {
  const { setOperation,  isFirstStep, setIsFirstStep } = useOperation();
  const { setSection } = useSection()
  const { setDataMemoryTable, setSizeMemory, setCodeSize, setNewPc } = useMemoryTable();
  const { setValueWrite, setRegisterWrite } = useRegistersTable();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message?.from === "UIManager") {
        if (message.operation === 'uploadMemory') {
          setOperation('uploadMemory');
          setSection('settings');
          setDataMemoryTable(message.payload);
          setSizeMemory(message.payload.memory.length - message.payload.codeSize );
          setCodeSize(message.payload.codeSize);
        }else if(message.operation === 'step') {
          setNewPc(Number(intToHex(message.pc)));
          if(!isFirstStep) {
            setSection('search')
            setOperation('step');
            setIsFirstStep(true);
          }
        }else if(message.operation === 'setRegister') {
          setValueWrite(message.value);
          setRegisterWrite(message.register);
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [setOperation, setDataMemoryTable, setSizeMemory]);

  return null;
};

export default MessageListener;
