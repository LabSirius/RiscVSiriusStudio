import { useRoutes } from "@/context/RoutesContext";
import ManualConfig from "../components/Settings/ManualConfig/ManualConfig";
import SwitchHexadecimal from "@/components/SwitchHexadecimal";
import Tables from "./Tables/Tables";
import MouseScrollIcon from "@/components/MouseScrollIcon";
import { useState, useEffect, useRef } from "react";

const SettingsSection = () => {
  const { routes } = useRoutes();
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
    <div
      ref={containerRef}
      className="relative flex gap-5 px-4 overflow-x-scroll overflow-y-auto"
    >
      <Tables />
      <div className="mt-1 section-container">
        <div className="flex flex-col gap-12">
          {routes === "uploadMemory" && <ManualConfig />}
          <SwitchHexadecimal />
        </div>
      </div>

      {showScrollIcon && (
        <div className="absolute right-8 bottom-[1rem] transform -translate-y-1/2 z-10 text-black left-animation">
          <div className="flex items-center justify-center">
            <MouseScrollIcon />
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsSection;
