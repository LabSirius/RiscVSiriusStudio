//import { Handle, Position } from "@xyflow/react";
import ContainerSVG from "../../ContainerSVG";

import Tunels from "./outputTunnels/Tunels";
// // import LabelSlashConatiner from "./LabelSlashContainer";
import LabelValueContainer from "./LabelValueContainer";
import { useSimulator } from "@/context/shared/SimulatorContext";
import CurrentInstructionInfo from "@/components/graphic/CurrentInstructionInfo";

export default function ControlUnit() {
  const { operation } = useSimulator();


  return (
    <div className="relative w-full">
      <h2 className="titleInElement absolute top-[50%] left-[12%] -translate-x-[12%] -translate-y-[50%]">
        Control Unit
      </h2>
      <div className="relative">
       <CurrentInstructionInfo />

        <ContainerSVG height={5} active={true} />

        {operation !== "uploadMemory" && (
          // <>
          //   <LabelSlashConatiner />
            <LabelValueContainer />
          // </>
        )}

        <Tunels />
      </div>

    </div>
  );
}
