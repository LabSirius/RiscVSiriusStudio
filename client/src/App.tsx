import { ThemeProvider } from "@/components/ui/theme/theme-provider";
import { MemoryRouter, Routes, Route } from "react-router-dom";

import { RoutesProvider } from "./context/RoutesContext";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sideBar";
import Sidebar  from "@/components/SideBar";
import MessageListener from "./components/MessageListener";

import ConvertSection from "@/sections/ConvertSection";
import HelpSection from "./sections/HelpSection";
import SettingsSection from "./sections/SettingsSection";


const App = () => {

  return (
    <MemoryRouter>
      <RoutesProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex h-full w-full overflow-hidden ">
        <SidebarProvider>
          <Sidebar />
          <SidebarTrigger />
          <MessageListener />
            <Routes>
              <Route path="/" element={<ConvertSection />} />
              <Route path="/help" element={<HelpSection />} />
              <Route path="/settings" element={<SettingsSection />} />
            </Routes>
        </SidebarProvider>
      </div>
    </ThemeProvider>
    </RoutesProvider>
  </MemoryRouter>
  );
};

export default App;
