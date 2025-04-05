import { ThemeProvider } from "@/components/panel/ui/theme/theme-provider";

import { OperationProvider } from "./context/panel/OperationContext";
import { MemoryTableProvider } from "./context/panel/MemoryTableContext";
import { RegistersTableProvider } from "./context/panel/RegisterTableContext";
import { ErrorProvider } from "./context/panel/ErrorContext";

import MainSectionContainer from "@/components/panel/Sections/MainSection/MainSectionContainer";

import MessageListener from "@/components/Message/MessageListener";
import Error from "@/components/panel/Error";
import { SectionProvider } from "./context/panel/SectionContext";


import { OverlayProvider } from "@/context/graphic/OverlayContext";
import { ReactFlowProvider } from "@xyflow/react";
import Canva from "./components/graphic/Canva/Canva";

const App = () => {  
  return (
    <SectionProvider>
      <OperationProvider>
        <MemoryTableProvider>
          <RegistersTableProvider>
            <ErrorProvider>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <ReactFlowProvider>
            <OverlayProvider>
              <div className="relative flex flex-col gap-2 min-w-dvh h-dvh overflow-hidden ">
                  <MessageListener />
                    <Canva />
                   <MainSectionContainer />
                  <Error />
              </div>
              </OverlayProvider>
              </ReactFlowProvider>
            </ThemeProvider>
            </ErrorProvider>
          </RegistersTableProvider>
        </MemoryTableProvider>
      </OperationProvider>
      </SectionProvider>
  );
};

export default App;
