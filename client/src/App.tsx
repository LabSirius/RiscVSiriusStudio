import { ThemeProvider } from "@/components/ui/theme/theme-provider";

import { OperationProvider } from "./context/OperationContext";
import { MemoryTableProvider } from "./context/MemoryTableContext";
import { RegistersTableProvider } from "./context/RegisterTableContext";
import { ErrorProvider } from "./context/ErrorContext";


import MessageListener from "@/components/Message/MessageListener";
import Error from "@/components/Error";

import MainSection from "@/sections/MainSection";
import { SectionProvider } from "./context/SectionContext";


const App = () => {
  return (
    <SectionProvider>
      <OperationProvider>
        <MemoryTableProvider>
          <RegistersTableProvider>
            <ErrorProvider>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
              <div className="relative flex w-full h-full overflow-hidden ">
                  <MessageListener />
                   <MainSection />
                  <Error />
              </div>
            </ThemeProvider>
            </ErrorProvider>
          </RegistersTableProvider>
        </MemoryTableProvider>
      </OperationProvider>
      </SectionProvider>
  );
};

export default App;
