import { ThemeProvider } from "@/components/ui/theme/theme-provider";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { RoutesProvider } from "./context/RoutesContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sideBar";
import Sidebar  from "@/components/SideBar";
import ConvertSection from "@/sections/ConvertSection";
import HelpSection from "./sections/HelpSection/HelpSection";
import MessageListener from "./components/MessageListener";

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
            </Routes>
        </SidebarProvider>
      </div>
    </ThemeProvider>
    </RoutesProvider>
  </MemoryRouter>
  );
};

export default App;
