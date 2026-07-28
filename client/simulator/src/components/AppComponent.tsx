import { useSimulator } from "@/context/shared/SimulatorContext";

import Shell from "@/components/shell/Shell";

import MonocycleDatapathPane from "@/components/graphic/Canva/monocycle/MonocycleDatapathPane";
import PipelineDatapathPane from "@/components/graphic/Canva/pipeline/PipelineDatapathPane";

const AppComponent = () => {
  const { typeSimulator } = useSimulator();

  // The datapath pane is selected once here, from the host-declared CPU mode,
  // and handed to the Shell as its slot (ADR-0005). The Shell renders it blind
  // to which CPU it is; each pane is statically typed to its CPU's view and
  // consumes its own `enabledEdges` kernel. This is the only per-CPU choice the
  // client makes — no message key is sniffed downstream.
  const datapath =
    typeSimulator === "monocycle" ? <MonocycleDatapathPane /> : <PipelineDatapathPane />;

  return <Shell datapath={datapath} />;
};

export default AppComponent;
