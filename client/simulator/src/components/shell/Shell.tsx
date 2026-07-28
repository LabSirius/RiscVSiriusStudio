import { ReactNode } from "react";

import { useSimulator } from "@/context/shared/SimulatorContext";
import { useTutorial } from "@/hooks/useTutorial";

import MainSectionContainer from "@/components/panel/Sections/MainSection/MainSectionContainer";
import MainSection from "@/components/panel/Sections/MainSection/MainSection";

/**
 * The Shell: the single, CPU-independent webview layer (ADR-0005). It renders
 * everything that reacts only to the Cycle effect — the registers, data-memory
 * and instruction-memory tables, the editor and its highlight, the side panels
 * and controls — and is mounted once, identical for both CPU models.
 *
 * The datapath diagram is not the Shell's concern: it is a per-CPU render passed
 * in through the `datapath` slot. The Shell renders that slot blind to which CPU
 * fills it and holds **no** datapath-view type (`MonocycleWires` /
 * `PipelineStages`); selecting the concrete pane happens once at mount, in the
 * caller (`AppComponent`). The DatapathPane seam that formalises the two panes
 * lands in ticket 05; here the slot simply wraps the existing Canva.
 */
const Shell = ({ datapath }: { datapath: ReactNode }) => {
  const { modeSimulator } = useSimulator();

  useTutorial();

  return (
    <div className="relative flex flex-col overflow-hidden min-w-dvh h-dvh ">
      {modeSimulator === "graphic" ? (
        <div className="relative flex flex-col overflow-hidden min-w-dvh h-dvh">
          {datapath}
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
  );
};

export default Shell;
