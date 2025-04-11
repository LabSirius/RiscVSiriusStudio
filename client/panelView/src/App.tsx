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
import { CurrentInstProvider } from "./context/graphic/CurrentInstContext";
import { ReactFlowProvider } from "@xyflow/react";
import Canva from "./components/graphic/Canva/Canva";
import CurrentInstructionInfo from "./components/graphic/CurrentInstructionInfo";
import { PCProvider } from "./context/shared/PCContext";
import { RegisterDataProvider } from "./context/shared/RegisterData";


const App = () => {  
  return (
    <SectionProvider>
      <OperationProvider>
        <PCProvider>
      <CurrentInstProvider>
        <LinesProvider>
        <MemoryTableProvider>
          <RegisterDataProvider >
          <RegistersTableProvider>
            <DialogProvider>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <ReactFlowProvider>
            <OverlayProvider>
              <div className="relative flex flex-col overflow-hidden min-w-dvh h-dvh ">
                  <MessageListener />  
                    <Canva />
                  <div className="relative">
                  <CurrentInstructionInfo />
                   <MainSectionContainer />
                  </div>
                  <Error />
              </div>
              </OverlayProvider>
              </ReactFlowProvider>
            </ThemeProvider>
            </DialogProvider>
          </RegistersTableProvider>
          </RegisterDataProvider>
        </MemoryTableProvider>
        </LinesProvider>
      </CurrentInstProvider>
      </PCProvider>
      </OperationProvider>
      </SectionProvider>
  );
};

export default App;
