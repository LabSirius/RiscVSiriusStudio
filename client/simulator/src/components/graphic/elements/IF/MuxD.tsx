import MuxContainer from "../MUXContainer";
import { Handle, Position } from "@xyflow/react";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import LabelValueWithHover from "@/components/graphic/elements/LabelValueWithHover";
import { useSimulator } from "@/context/shared/SimulatorContext";

function MuxD() {
  const { currentMonocycleResult } = useCurrentInst();
  const { operation } = useSimulator();

  const signal = currentMonocycleResult.buMux.signal;



  return (
    <div className="relative w-full h-full">
      <div className="relative w-full h-full rotate-90">
        <MuxContainer  signal={signal === "0" ? "1" : "0"}/>
        {operation !== "uploadMemory" && (
          <div className="absolute top-[-2rem] left-[3rem] " style={{ transform: "rotate(-90deg)" }}>
            <LabelValueWithHover
              label=""
              value={`b'${signal}`}
              decimal={signal}
              binary={signal}
              hex={signal}
              input={false}
              positionClassName=""
            />
          </div>
        )}  
      </div>

      <Handle
        type="target"
        position={Position.Top}
        id="adder4"
        className="input"
        style={{ left: "4rem", top: "2.6rem" }}
      />

      <Handle
        type="target"
        position={Position.Top}
        id="alu"
        className="input"
        style={{ left: "0rem", top: "2.6rem" }}
      />

      <Handle
        type="target"
        id="bu"
        position={Position.Right}
        className="input"
        style={{ top: "4.5rem", right: "-1.5rem" }}
      />

      <Handle
        type="source"
        position={Position.Bottom}
        className="output"
        style={{ top: "5rem" }}
      />
    </div>
  );
}

export default MuxD;
