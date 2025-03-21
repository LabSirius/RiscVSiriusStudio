// MessageListener.tsx
import { useEffect } from "react";
import { useRoutes } from "@/context/RoutesContext";
import { useMemoryTable } from "@/context/MemoryTableContext";

const MessageListener = () => {
  const { setRoutes } = useRoutes();
  const { setDataMemoryTable, sizeMemory, setSizeMemory } = useMemoryTable();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.from === "UIManager") {
        if (event.data.data.operation === 'uploadMemory') {
          setRoutes('uploadMemory');
          setDataMemoryTable(event.data.data.payload);
          setSizeMemory(event.data.data.payload.memory.length - event.data.data.payload.codeSize );

        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [setRoutes, setDataMemoryTable, setSizeMemory, sizeMemory]);

  return null;
};

export default MessageListener;
