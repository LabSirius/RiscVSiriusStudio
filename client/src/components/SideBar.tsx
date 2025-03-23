import { useOperation } from "@/context/OperationContext";

import { useSection } from "@/context/SectionContext";

import { Button } from "@/components/ui/button";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sideBar";

import { Search, Calculator, Info, Settings } from "lucide-react";

export function SideBar() {
  const { operation } = useOperation();
  const { setSection } = useSection();
  return (
    <Sidebar>
      <SidebarContent className="relative min-h-full overflow-hidden">
        <SidebarGroup className="flex flex-col flex-1">
          <SidebarGroupLabel>Options</SidebarGroupLabel>
          <SidebarGroupContent className="flex flex-col">
            <SidebarMenu className="flex flex-col justify-between min-h-full pl-3 mt-2">

            <div className="flex flex-col items-start gap-3">
              { !(operation === "") && !(operation === "uploadMemory") && (
                <SidebarMenuItem>
                  <a onClick={() => setSection('search')} className="curser-pointer">
                        <Button variant="outline" size="icon">
                          <Search />
                        </Button>
                  
                  </a>
                </SidebarMenuItem>
              )}

              
              {!(operation === "uploadMemory") && (
                <SidebarMenuItem>
                  <a onClick={() => setSection('convert')} className="curser-pointer">
                        <Button variant="outline" size="icon">
                          <Calculator />
                        </Button>
                  
                  </a>
                </SidebarMenuItem>
              )}
            </div>

              {(operation === "uploadMemory") && (
               <SidebarMenuItem>
                <a onClick={() =>  setSection('settings')} className="curser-pointer">
                 
                      <Button variant="outline" size="icon">
                        <Settings />
                      </Button>
            
                </a>
              </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mb-[.5rem]">
          <SidebarGroupLabel>Others</SidebarGroupLabel>

          <div className="flex flex-col gap-5 pl-3 mt-2">

            <SidebarMenuItem>
              <a onClick={() =>  setSection('help')} className="curser-pointer">
                <Button variant="outline" size="icon">
                  <Info />
                </Button>
              </a>
            </SidebarMenuItem>
          </div>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default SideBar;
