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
      if (event.data?.from === "UIManager") {
        if (event.data.data.operation === 'uploadMemory') {
          setRoutes('uploadMemory');
          setDataMemoryTable(event.data.data.payload);
          setSizeMemory(event.data.data.payload.memory.length - event.data.data.payload.codeSize );
          setCodeSize(event.data.data.payload.codeSize);
        }
        if(event.data.data.operation === 'step') {
          console.log(event.data.data);
          setRoutes('step');
          const pc = Number(intToHex(event.data.data.pc));
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
