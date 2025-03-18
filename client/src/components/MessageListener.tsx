// MessageListener.tsx
import { useEffect } from "react";
import { useRoutes } from "@/context/RoutesContext";

const MessageListener = () => {
  const { setRoutes } = useRoutes();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "FROM_VSCODE") {
        if (event.data.payload.operation === 'uploadMemory') {
          setRoutes(['uploadMemory']);
          console.log('uploadMemory desde REACT');  
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [setRoutes]);

  return null;
};

export default MessageListener;
