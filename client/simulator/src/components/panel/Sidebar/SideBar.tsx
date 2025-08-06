import React, { JSX } from "react";
import { useSimulator } from "@/context/shared/SimulatorContext";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sideBar";
import CircleActive from "./CircleActive";
import { Sidebar, SidebarContent, SidebarMenuItem } from "@/components/ui/sideBar";
import { Text, Search, Calculator, Info, Settings } from "lucide-react";

type SectionType = string;

interface MenuItemProps {
  sectionName: SectionType;
  currentSection: SectionType;
  setSection: (section: SectionType) => void;
  children: React.ReactNode;
}

interface SectionItem {
  name: SectionType;
  icon: JSX.Element;
  show: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ sectionName, currentSection, setSection, children }) => (
  <SidebarMenuItem className="flex items-center gap-1">
    <a onClick={() => setSection(sectionName)} className="cursor-pointer">
      <Button variant="outline" size="icon">
        {children}
      </Button>
    </a>
    {currentSection === sectionName && <CircleActive />}
  </SidebarMenuItem>
);


export function SideBar() {
  const { operation, section, setSection } = useSimulator();
  const { setOpen, setHoveringSidebar } = useSidebar();

  const mainSections: SectionItem[] = [
    {
      name: "program",
      icon: <Text />,
      show: (operation === "uploadMemory" || operation === "step") ,
    },
    {
      name: "search",
      icon: <Search />,
      show: !(operation === "") && !(operation === "uploadMemory"),
    },
    {
      name: "convert",
      icon: <Calculator />,
      show: true,
    },
    {
      name: "settings",
      icon: <Settings />,
      show: operation === "uploadMemory" || operation === "step",
    },
  ];

  return (
    <Sidebar
      onMouseEnter={() => {
        setOpen(true);
        setHoveringSidebar(true);
      }}
      onMouseLeave={() => {
        setOpen(false);
        setHoveringSidebar(false);
      }}
    >
      <SidebarContent className="flex flex-col justify-between w-full h-full p-3">
        <div className="flex flex-col items-start gap-3">
          {mainSections.map(
            (item) =>
              item.show && (
                <MenuItem
                  key={item.name}
                  sectionName={item.name}
                  currentSection={section}
                  setSection={setSection}
                >
                  {item.icon}
                </MenuItem>
              )
          )}
        </div>

        <div className="flex flex-col items-start gap-3">
          <MenuItem sectionName="help" currentSection={section} setSection={setSection}>
            <Info />
          </MenuItem>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export default SideBar;