import { ThemeProvider } from "@/components/panel/ui/theme/theme-provider";

import { OperationProvider } from "./context/panel/OperationContext";
import { MemoryTableProvider } from "./context/panel/MemoryTableContext";
import { RegistersTableProvider } from "./context/panel/RegisterTableContext";
import { DialogProvider } from "./context/panel/DialogContext";
import { LinesProvider } from "./context/panel/LinesContext";

import MainSectionContainer from "@/components/panel/Sections/MainSection/MainSectionContainer";

import MessageListener from "@/components/Message/MessageListener";
import Error from "@/components/panel/Dialog";
import { SectionProvider } from "./context/panel/SectionContext";


import { OverlayProvider } from "@/context/graphic/OverlayContext";
import { ReactFlowProvider } from "@xyflow/react";
import Canva from "./components/graphic/Canva/Canva";

const App = () => {  
  return (
    <SectionProvider>
      <OperationProvider>
        <LinesProvider>
        <MemoryTableProvider>
          <RegistersTableProvider>
            <DialogProvider>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <ReactFlowProvider>
            <OverlayProvider>
              <div className="relative flex flex-col overflow-hidden min-w-dvh h-dvh ">
                  <MessageListener />
                    <Canva />
                   <MainSectionContainer />
                  <Error />
              </div>
              </OverlayProvider>
              </ReactFlowProvider>
            </ThemeProvider>
            </DialogProvider>
          </RegistersTableProvider>
        </MemoryTableProvider>
        </LinesProvider>
      </OperationProvider>
      </SectionProvider>
  );
};

export default App;
