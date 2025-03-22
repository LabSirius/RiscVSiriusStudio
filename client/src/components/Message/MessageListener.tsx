// MessageListener.tsx
import { useEffect } from "react";
import { useRoutes } from "@/context/RoutesContext";
import { useMemoryTable } from "@/context/MemoryTableContext";


import { intToHex } from "@/utils/tables/handlerConversions";

const MessageListener = () => {
  const { setRoutes } = useRoutes();
  const { setDataMemoryTable, setSizeMemory, setCodeSize, setNewPc } = useMemoryTable();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message?.from === "UIManager") {
        if (message.operation === 'uploadMemory') {
          setRoutes('uploadMemory');
          setDataMemoryTable(message.payload);
          setSizeMemory(message.payload.memory.length - message.payload.codeSize );
          setCodeSize(message.payload.codeSize);
        }
        if(message.operation === 'step') {
          setRoutes('step');
          const pc = Number(intToHex(message.pc));
          setNewPc(pc);
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [setRoutes, setDataMemoryTable, setSizeMemory]);

  return null;
};

export default MessageListener;
