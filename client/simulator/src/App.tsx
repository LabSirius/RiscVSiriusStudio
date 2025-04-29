import { ThemeProvider } from "@/components/panel/ui/theme/theme-provider";

import { useSimulator } from "./context/shared/SimulatorContext";
import { MemoryTableProvider } from "./context/panel/MemoryTableContext";
import { RegistersTableProvider } from "./context/panel/RegisterTableContext";
import { DialogProvider } from "./context/panel/DialogContext";
import { LinesProvider } from "./context/panel/LinesContext";

import MainSectionContainer from "@/components/panel/Sections/MainSection/MainSectionContainer";
import MainSection from "@/components/panel/Sections/MainSection/MainSection";

import MessageListener from "@/components/Message/MessageListener";
import Error from "@/components/panel/Dialog";

import { OverlayProvider } from "@/context/graphic/OverlayContext";
import { CurrentInstProvider } from "./context/graphic/CurrentInstContext";
import { ReactFlowProvider } from "@xyflow/react";
import Canva from "./components/graphic/Canva/Canva";
import CurrentInstructionInfo from "./components/graphic/CurrentInstructionInfo";
import { RegisterDataProvider } from "./context/shared/RegisterData";

const App = () => {
  const { typeSimulator } = useSimulator();

  return (
      <CurrentInstProvider>
        <LinesProvider>
          <MemoryTableProvider>
            <RegisterDataProvider>
              <RegistersTableProvider>
                <DialogProvider>
                  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                    <ReactFlowProvider>
                      <OverlayProvider>
                        <div className="relative flex flex-col overflow-hidden min-w-dvh h-dvh ">
                          <MessageListener />
                          {typeSimulator === "graphic" ? (
                            <>
                              <Canva />
                              <CurrentInstructionInfo />
                              <MainSectionContainer />
                            </>
                          ) : (
                            <div className="relative flex w-full h-screen overflow-hidden ">
                              <MainSection />
                            </div>
                          )}

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
  );
};

export default App;
