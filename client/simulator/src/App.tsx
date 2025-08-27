import { useSimulator } from "./context/shared/SimulatorContext";

import MainSectionContainer from "@/components/panel/Sections/MainSection/MainSectionContainer";
import MainSection from "@/components/panel/Sections/MainSection/MainSection";

import MonocycleCanva from "@/components/graphic/Canva/monocycle/MonoCycleCanva";
import PipelineCanva from "./components/graphic/Canva/pipeline/PipelineCanva";
import Providers from "./providers";

import { useTutorial } from "./hooks/useTutorial";

const App = () => {
  const { modeSimulator, typeSimulator } = useSimulator();

  useTutorial()

  
  return (
    <Providers>
      <div className="relative flex flex-col overflow-hidden min-w-dvh h-dvh ">
        {modeSimulator === "graphic" ? (
          <div className="relative flex flex-col overflow-hidden min-w-dvh h-dvh">
            {typeSimulator === "monocycle" ? <MonocycleCanva /> : <PipelineCanva />}
            <div className="relative">
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
