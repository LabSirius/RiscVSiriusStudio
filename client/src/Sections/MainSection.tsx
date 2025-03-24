import MouseScrollIcon from "@/components/MouseScrollIcon";
import { useState, useEffect, useRef } from "react";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sideBar";
import Sidebar from "@/components/SideBar";

import { useOperation } from "@/context/OperationContext";
import { useSection } from "@/context/SectionContext";

import ConvertSection from "./ConvertSection";
import Tables from "./Tables/Tables";
import SettingsSection from "./SettingsSection";
import SearchSection from "./SearchSection";
import HelpSection from "./HelpSection";

const MainSection = () => {
  const { operation } = useOperation();
  const { section } = useSection();
  const [showScrollIcon, setShowScrollIcon] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const BASE_WIDTH = 1296; 
    if (window.innerWidth > BASE_WIDTH) {
      setShowScrollIcon(false);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop > 0 || container.scrollLeft > 0) {
        setShowScrollIcon(false);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);
  
  return (
    <SidebarProvider ref={containerRef}>
      <Sidebar />
      <SidebarTrigger />

      {operation === "" && (section === "convert" ? <ConvertSection /> : <HelpSection />)}

      {(operation === "uploadMemory" || operation === "step") && (
        <div className="relative flex gap-5 px-4 overflow-x-scroll overflow-y-auto">
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

    { operation !== "" && showScrollIcon && (
        <div className="absolute right-8 bottom-[1rem] transform -translate-y-1/2 z-10000 text-black left-animation ">
          <div className="flex items-center justify-center">
            <MouseScrollIcon />
          </div>
        </div>
      )}

    </SidebarProvider>
  );
};

export default MainSection;
