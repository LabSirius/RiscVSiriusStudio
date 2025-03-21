// MessageListener.tsx
import { useEffect } from "react";
import { useRoutes } from "@/context/RoutesContext";
import { useMemoryTable } from "@/context/MemoryTableContext";

const MessageListener = () => {
  const { setRoutes } = useRoutes();
  const { setDataMemoryTable } = useMemoryTable();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.from === "UIManager") {
        if (event.data.data.operation === 'uploadMemory') {
          setRoutes('uploadMemory');
          setDataMemoryTable(event.data.data.payload);
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [setRoutes, setDataMemoryTable]);

  return null;
};

export default MessageListener;
