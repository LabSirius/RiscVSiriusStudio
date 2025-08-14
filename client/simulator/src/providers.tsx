import React from "react";

import { ThemeProvider } from "@/components/ui/theme/theme-provider";
import { ReactFlowProvider } from "@xyflow/react";
import { CurrentInstProvider } from "./context/graphic/CurrentInstContext";
import { MemoryTableProvider } from "./context/shared/MemoryTableContext";
import { RegistersTableProvider } from "./context/panel/RegisterTableContext";
import { RegisterDataProvider } from "./context/shared/RegisterData";
import { DialogProvider } from "./context/panel/DialogContext";
import { LinesProvider } from "./context/panel/LinesContext";
import { OverlayProvider } from "@/context/graphic/OverlayContext";

import MessageListener from "@/components/Message/MessageListener";
import Dialog from "@/components/panel/Dialog";
import { CustomOptionSimulateProvider } from "./context/shared/CustomOptionSimulate";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ReactFlowProvider>
        <CurrentInstProvider>
          <CustomOptionSimulateProvider>
            <MemoryTableProvider>
              <RegistersTableProvider>
                <RegisterDataProvider>
                  <DialogProvider>
                    <LinesProvider>
                      <OverlayProvider>
                        <MessageListener />
                        <Dialog />

                        {children}
                      </OverlayProvider>
                    </LinesProvider>
                  </DialogProvider>
                </RegisterDataProvider>
              </RegistersTableProvider>
            </MemoryTableProvider>
          </CustomOptionSimulateProvider>
        </CurrentInstProvider>
      </ReactFlowProvider>
    </ThemeProvider>
  );
};

export default Providers;
