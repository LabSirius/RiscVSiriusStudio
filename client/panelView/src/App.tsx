import { ThemeProvider } from "@/components/ui/theme/theme-provider";

import { OperationProvider } from "./context/OperationContext";
import { MemoryTableProvider } from "./context/MemoryTableContext";
import { RegistersTableProvider } from "./context/RegisterTableContext";
import { ErrorProvider } from "./context/ErrorContext";

import MainSectionContainer from "./sections/MainSection/MainSectionContainer";

import MessageListener from "@/components/Message/MessageListener";
import Error from "@/components/Error";
import { SectionProvider } from "./context/SectionContext";

const App = () => {  
  return (
    <SectionProvider>
      <OperationProvider>
        <MemoryTableProvider>
          <RegistersTableProvider>
            <ErrorProvider>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
              <div className="relative flex w-full h-dvh overflow-hidden ">
                  <MessageListener />
                   <MainSectionContainer />
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
