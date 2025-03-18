import  { useEffect } from "react";
import { ThemeProvider } from "@/components/ui/theme/theme-provider";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sideBar";
import Sidebar  from "@/components/SideBar";
import ConvertSection from "@/Sections/ConvertSection";
import HelpSection from "./Sections/HelpSection/HelpSection";

const App = () => {

//Receive messages from vscode
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "FROM_VSCODE") {
          console.log("Mensaje recibido en React:", event.data.payload);
      }
  };
  window.addEventListener("message", handleMessage);
  return () => window.removeEventListener("message", handleMessage);
}, []);

  return (
      <MemoryRouter>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex h-full w-full overflow-hidden ">
        <SidebarProvider>
          <Sidebar />
          <SidebarTrigger />
          
        
            <Routes>
              <Route path="/" element={<ConvertSection />} />
              <Route path="/help" element={<HelpSection />} />
            </Routes>
        </SidebarProvider>
      </div>
    </ThemeProvider>
  </MemoryRouter>
  );
};

export default App;
