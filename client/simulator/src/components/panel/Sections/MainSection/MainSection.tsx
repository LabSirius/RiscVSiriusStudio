import MouseScrollIcon from "@/components/panel/MouseScrollIcon";
import { useState, useEffect } from "react";

import { SidebarProvider } from "@/components/ui/sideBar";
import Sidebar from "@/components/panel/Sidebar/SideBar";

import { useSimulator } from "@/context/shared/SimulatorContext";

import ConvertSection from "../ConvertSection";
import Tables from "../Tables/Tables";
import HelpSection from "../HelpSection";
import { useTheme } from "@/components/ui/theme/theme-provider";


const MainSection = () => {
  const { modeSimulator, operation, section } = useSimulator();
  const { setTheme } = useTheme();
  const [showScrollIcon, setShowScrollIcon] = useState(false);
  // Convert panel collapse lives here (not in ConvertSection) so it survives the
  // convert↔help remount. Defaults collapsed, like the program-memory table.
  const [convertCollapsed, setConvertCollapsed] = useState(true);
  const BASE_WIDTH = 1296;

  // VS Code signals theme changes by live-mutating the webview <body> class
  // (vscode-light / vscode-dark), not by any message or re-render. Reading it
  // once on mount freezes the theme at load time (the table-theme-toggle bug),
  // so observe the body class and re-derive on every change.
  useEffect(() => {
    const applyVscodeTheme = () => {
      setTheme(document.body.classList.contains("vscode-light") ? "light" : "dark");
    };
    applyVscodeTheme();
    const observer = new MutationObserver(applyVscodeTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
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

      {operation === "uploadMemory" || operation === "step" ? (
        <div
          className={`relative flex gap-5 p-4 overflow-x-auto overflow-y-hidden  ${
            !(modeSimulator === "graphic") && "h-screen"
          } `}>
          <Tables />
          {section === "convert" ? (
            <ConvertSection
              collapsible
              collapsed={convertCollapsed}
              onToggle={setConvertCollapsed}
            />
          ) : (
            <HelpSection />
          )}
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
