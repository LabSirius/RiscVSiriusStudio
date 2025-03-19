import { useRoutes } from "@/context/RoutesContext";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/theme/mode-toggle";
import { useNavigate } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sideBar";

import { Calculator, Info, Settings } from "lucide-react";

export function SideBar() {
  const navigate = useNavigate();
  const { routes } = useRoutes();
  return (
    <Sidebar>
      <SidebarContent className="relative min-h-full overflow-hidden">
        <SidebarGroup className="flex flex-col flex-1">
          <SidebarGroupLabel>Options</SidebarGroupLabel>
          <SidebarGroupContent className="flex flex-col flex-1">
            <SidebarMenu className="flex flex-col justify-between min-h-full mt-2 pl-3">
            {!(routes === "uploadMemory") && (
              <SidebarMenuItem>
                <a onClick={() => navigate("/")} className="curser-pointer">
                      <Button variant="outline" size="icon">
                        <Calculator />
                      </Button>
                      <span className="ml-4 0">Convert</span>
                
                </a>
              </SidebarMenuItem>
            )}

              {(routes === "uploadMemory") && (
               <SidebarMenuItem>
                <a onClick={() => navigate("/")} className="curser-pointer">
                 
                      <Button variant="outline" size="icon">
                        <Settings />
                      </Button>
                      <span className="ml-4 0">Settings</span>
            
                </a>
              </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mb-[2rem]">
          <SidebarGroupLabel>Others</SidebarGroupLabel>

          <div className="flex flex-col mt-2  pl-3 gap-5">
            <SidebarMenuItem>
              <ModeToggle />
            </SidebarMenuItem>

            <SidebarMenuItem>
              <a onClick={() => navigate("/help")} className="curser-pointer">
                <Button variant="outline" size="icon">
                  <Info />
                </Button>
                <span className="ml-4 ">More info</span>
              </a>
            </SidebarMenuItem>
          </div>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default SideBar;
