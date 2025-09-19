import ContainerSVG from "../../ContainerSVG";

import Tunels from "./outputTunnels/Tunels";
import LabelValueContainer from "./LabelValueContainer";
import { useSimulator } from "@/context/shared/SimulatorContext";
import CurrentInstructionInfo from "@/components/graphic/CurrentInstructionInfo";

export default function ControlUnit() {
  const { operation, typeSimulator } = useSimulator();


  return (
    <div className="relative w-full">
      <h2 className="titleInElement absolute top-[50%] left-[12%] -translate-x-[12%] -translate-y-[50%]">
        Control Unit
      </h2>
      <div className="relative">
       
        {typeSimulator === "monocycle" && <CurrentInstructionInfo /> }


        <ContainerSVG height={typeSimulator === "monocycle" ? 5 : 7.5} active={true} translate={false} />

        {operation !== "uploadMemory" && (
          // <>
          //   <LabelSlashConatiner />
            <LabelValueContainer />
          // </>
        )}

        {typeSimulator === "monocycle" && (<Tunels />)}
        
      </div>

    </div>
  );
}
