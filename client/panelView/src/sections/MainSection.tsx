import MouseScrollIcon from "@/components/MouseScrollIcon";
import { useState, useEffect } from "react";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sideBar";
import Sidebar from "@/components/SideBar";

import { useOperation } from "@/context/OperationContext";
import { useSection } from "@/context/SectionContext";

import ConvertSection from "./ConvertSection";
import Tables from "./Tables/Tables";
import SettingsSection from "./SettingsSection";
import SearchSection from "./SearchSection";
import HelpSection from "./HelpSection";
import { useTheme } from "@/components/ui/theme/theme-provider"

const MainSection = () => {
  const { setTheme } = useTheme();
  const { operation } = useOperation();
  const { section } = useSection();
  const [showScrollIcon, setShowScrollIcon] = useState(true);
  const BASE_WIDTH = 1296;

  useEffect(() => {
    // Configurar tema según la clase del body
    if (document.body.classList.contains('vscode-light')) {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  }, [setTheme]);

  useEffect(() => {
    // Función para verificar el ancho de la ventana
    const handleResize = () => {
      if (window.innerWidth < BASE_WIDTH) {
        setShowScrollIcon(true);
      } else {
        setShowScrollIcon(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarTrigger />

      {operation === "" && (section === "convert" ? <ConvertSection /> : <HelpSection />)}

      {(operation === "uploadMemory" || operation === "step") && (
        <div className="relative flex gap-5 px-4 overflow-x-scroll overflow-y-hidden">
          <Tables />
          {operation === "uploadMemory" &&
            (section === "settings" ? <SettingsSection /> : <HelpSection />)}

          {operation === "step" &&
            (section === "search" ? (
              <SearchSection />
            ) : section === "convert" ? (
              <ConvertSection />
            ) : section === "settings" ? (
              <SettingsSection />
            ) : (
              <HelpSection />
            ))}
        </div>
      )}

      {operation !== "" && showScrollIcon && (
        <div className="absolute right-8 bottom-[1rem] transform -translate-y-1/2 z-10000 text-black left-animation">
          <div className="flex items-center justify-center">
            <MouseScrollIcon />
          </div>
        </div>
      )}
    </SidebarProvider>
  );
};

export default MainSection;
