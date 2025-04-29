import MouseScrollIcon from "@/components/panel/MouseScrollIcon";
import { useState, useEffect } from "react";

import { SidebarProvider, SidebarTrigger } from "@/components/panel/ui/sideBar";
import Sidebar from "@/components/panel/Sidebar/SideBar";

import { useOperation } from "@/context/panel/OperationContext";
import { useSection } from "@/context/panel/SectionContext";

import ProgramSection from "../ProgramSection";
import ConvertSection from "../ConvertSection";
import Tables from "../Tables/Tables";
import SettingsSection from "../SettingsSection";
import SearchSection from "../SearchSection";
import HelpSection from "../HelpSection";
import { useTheme } from "@/components/panel/ui/theme/theme-provider";
import { useSimulator } from "@/context/shared/SimulatorContext";

const MainSection = () => {
  const {typeSimulator} = useSimulator();
  const { setTheme } = useTheme();
  const { operation } = useOperation();
  const { section } = useSection();
  const [showScrollIcon, setShowScrollIcon] = useState(false);
  const BASE_WIDTH = 1296;

  useEffect(() => {
    if (document.body.classList.contains("vscode-light")) {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  }, [setTheme]);

  useEffect(() => {
    const handleResize = () => {
      if (
        window.innerWidth < BASE_WIDTH &&
        (operation === "uploadMemory" || operation === "step")
      ) {
        setShowScrollIcon(true);
        const timer = setTimeout(() => {
          setShowScrollIcon(false);
        }, 1000);
        return () => clearTimeout(timer);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [operation]);

  return (
    <SidebarProvider className="h-full overflow-hidden">
      <Sidebar />
      <SidebarTrigger />

      {operation === "uploadMemory" || operation === "step" ? (
        <div className={`relative flex gap-5 p-4 overflow-x-auto overflow-y-hidden  ${!(typeSimulator === "graphic") && 'h-screen'} `}>
          <Tables />
          {operation === "uploadMemory" &&
            (section === "settings" ? (
              <SettingsSection />
            ) : section === "program" ? (
              <ProgramSection />
            ) : (
              <HelpSection />
            ))}

          {operation === "step" &&
            (section === "program" ? (
              <ProgramSection />
            ) : section === "search" ? (
              <SearchSection />
            ) : section === "convert" ? (
              <ConvertSection />
            ) : section === "settings" ? (
              <SettingsSection />
            ) : (
              <HelpSection />
            ))}
        </div>
      ) : section === "convert" ? (
        <ConvertSection />
      ) : (
        <HelpSection />
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
