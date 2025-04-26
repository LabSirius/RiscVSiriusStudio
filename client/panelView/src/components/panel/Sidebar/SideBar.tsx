import { useOperation } from "@/context/panel/OperationContext";

import { useSection } from "@/context/panel/SectionContext";

import { Button } from "@/components/panel/ui/button";

import CircleActive from "./CircleActive";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/panel/ui/sideBar";

import { Text, Search, Calculator, Info, Settings } from "lucide-react";

export function SideBar() {
  const { operation } = useOperation();
  const { section, setSection } = useSection();
  return (
    <Sidebar >
      <SidebarContent className="relative w-full h-full pr-10 overflow-x-hidden overflow-y-auto hide-scrollbar">
        <SidebarGroup className="flex flex-col flex-1">
          <SidebarGroupLabel>Options</SidebarGroupLabel>
          <SidebarGroupContent className="flex flex-col">
            <SidebarMenu className="flex flex-col justify-between h-auto pl-3 mt-1">

            <div className="flex flex-col items-start gap-3">
            {(operation === "uploadMemory" || operation === "step") && (
                <SidebarMenuItem className="flex items-center gap-1">
                 <a onClick={() =>  setSection('program')} className="curser-pointer">
                  
                       <Button variant="outline" size="icon">
                         <Text />
                       </Button>
                 </a>
                 {section === "program" && <CircleActive />}
               </SidebarMenuItem>
               )}

              { !(operation === "") && !(operation === "uploadMemory") && (
                <SidebarMenuItem className="flex items-center gap-1">
                  <a onClick={() => setSection('search')} className="curser-pointer">
                        <Button variant="outline" size="icon">
                          <Search />
                        </Button>
                  
                  </a>
                  {section === "search" && <CircleActive />}
                </SidebarMenuItem>
              )}

              
              {!(operation === "uploadMemory") && (
                <SidebarMenuItem className="flex items-center gap-1">
                  <a onClick={() => setSection('convert')} className="curser-pointer">
                        <Button variant="outline" size="icon">
                          <Calculator />
                        </Button>
                  
                  </a>
                  {section === "convert" && <CircleActive />}
                </SidebarMenuItem>
               
              )}
           

              {(operation === "uploadMemory" || operation === "step") && (
               <SidebarMenuItem className="flex items-center gap-1">
                <a onClick={() =>  setSection('settings')} className="curser-pointer">
                 
                      <Button variant="outline" size="icon">
                        <Settings />
                      </Button>
                </a>
                {section === "settings" && <CircleActive />}
              </SidebarMenuItem>
              )}
             </div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mb-[.5rem]">

          <div className="flex flex-col gap-5 pl-3 mt-2">

            <SidebarMenuItem className="flex items-center gap-1">
              <a onClick={() =>  setSection('help')} className="curser-pointer">
                <Button variant="outline" size="icon">
                  <Info />
                </Button>
              </a>
              {section === "help" && <CircleActive />}
            </SidebarMenuItem>
          </div>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default SideBar;
