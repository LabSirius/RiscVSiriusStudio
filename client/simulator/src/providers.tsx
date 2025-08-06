import React from "react";

import { ThemeProvider } from "@/components/ui/theme/theme-provider";
import { ReactFlowProvider } from "@xyflow/react";
import { CurrentInstProvider } from "./context/graphic/CurrentInstContext";
import { MemoryTableProvider } from "./context/panel/MemoryTableContext";
import { RegistersTableProvider } from "./context/panel/RegisterTableContext";
import { RegisterDataProvider } from "./context/shared/RegisterData";
import { DialogProvider } from "./context/panel/DialogContext";
import { LinesProvider } from "./context/panel/LinesContext";
import { OverlayProvider } from "@/context/graphic/OverlayContext";

import MessageListener from "@/components/Message/MessageListener";
import Dialog from "@/components/panel/Dialog";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ReactFlowProvider>
        <CurrentInstProvider>
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
        </CurrentInstProvider>
      </ReactFlowProvider>
    </ThemeProvider>
  );
};

export default Providers;
