import { useSimulator } from "@/context/shared/SimulatorContext";

import Shell from "@/components/shell/Shell";

import MonocycleCanva from "@/components/graphic/Canva/monocycle/MonoCycleCanva";
import PipelineCanva from "./graphic/Canva/pipeline/PipelineCanva";

const AppComponent = () => {
  const { typeSimulator } = useSimulator();

  // The datapath pane is selected once here, from the host-declared CPU mode,
  // and handed to the Shell as its slot (ADR-0005). The Shell renders it blind
  // to which CPU it is; this is the only per-CPU choice the client makes.
  const datapath = typeSimulator === "monocycle" ? <MonocycleCanva /> : <PipelineCanva />;

  return <Shell datapath={datapath} />;
};

export default AppComponent;
