import { ThemeProvider } from "@/components/ui/theme/theme-provider";
import { MemoryRouter, Routes, Route } from "react-router-dom";

import { OperationProvider } from "./context/OperationContext";
import { MemoryTableProvider } from "./context/MemoryTableContext";
import { RegistersTableProvider } from "./context/RegisterTableContext";
import { ErrorProvider } from "./context/ErrorContext";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sideBar";
import Sidebar from "@/components/SideBar";
import MessageListener from "@/components/Message/MessageListener";
import Error from "@/components/Error";

import ConvertSection from "@/sections/ConvertSection";
import HelpSection from "@/sections/HelpSection";
import SettingsSection from "@/sections/SimulationSection";


const App = () => {
  return (
    <MemoryRouter>
      <OperationProvider>
        <MemoryTableProvider>
          <RegistersTableProvider>
            <ErrorProvider>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
              <div className="relative flex w-full h-full overflow-hidden ">
                <SidebarProvider>
                  <Sidebar />
                  <SidebarTrigger />
                  <MessageListener />
                  <Routes>
                    <Route path="/" element={<ConvertSection />} />
                    <Route path="/help" element={<HelpSection />} />
                    <Route path="/settings" element={<SettingsSection />} />
                  </Routes>
                  <Error />
                </SidebarProvider>
              </div>
            </ThemeProvider>
            </ErrorProvider>
          </RegistersTableProvider>
        </MemoryTableProvider>
      </OperationProvider>
    </MemoryRouter>
  );
};

export default App;
