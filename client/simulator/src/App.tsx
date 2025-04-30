import { useSimulator } from "./context/shared/SimulatorContext";

import MainSectionContainer from "@/components/panel/Sections/MainSection/MainSectionContainer";
import MainSection from "@/components/panel/Sections/MainSection/MainSection";

import Canva from "./components/graphic/Canva/Canva";
import CurrentInstructionInfo from "./components/graphic/CurrentInstructionInfo";
import Providers from "./providers";

const App = () => {
  const { typeSimulator } = useSimulator();

  return (
    <Providers>
      <div className="relative flex flex-col overflow-hidden min-w-dvh h-dvh ">
        {typeSimulator === "graphic" ? (
          <div className="relative flex flex-col overflow-hidden min-w-dvh h-dvh">
            <Canva />
            <div className="relative">
              <CurrentInstructionInfo />
              <MainSectionContainer />
            </div>
          </div>
        ) : (
          <div className="relative flex w-full h-screen overflow-hidden ">
            <MainSection />
          </div>
        )}
      </div>
    </Providers>
  );
};

export default App;
