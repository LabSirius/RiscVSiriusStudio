import MuxContainer from "../MUXContainer";
import { Handle, Position } from "@xyflow/react";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import LabelValueWithHover from "@/components/graphic/elements/LabelValueWithHover";
import { useSimulator } from "@/context/shared/SimulatorContext";
import { binaryToInt } from "@/utils/handlerConversions"; 

function MuxD() {
  const { currentMonocycleResult, pipelineValuesStages } = useCurrentInst();
  const { operation, typeSimulator } = useSimulator();

  let signal: string;

  if (typeSimulator === 'pipeline') {
    const exStage = pipelineValuesStages?.EX;
    if (exStage?.instruction) {
      if (exStage.instruction.pc === -1) {
        signal = '-'; 
      } else {
        const rawResult = exStage.BranchResult;
        signal = rawResult === 'X' ? '0' : rawResult;
      }
    } else {
      signal = 'X';
    }
  } else {
    signal = currentMonocycleResult?.buMux?.signal || 'X';
  }

  return (
    <div className="relative w-full h-full">
      <div className="relative w-full h-full rotate-90">
        <MuxContainer signal={signal === '0' ? '1' : signal === '1' ? '0' : signal} />
        
        {operation !== "uploadMemory" && (
          <div className="absolute top-[-2rem] left-[3rem] " style={{ transform: "rotate(-90deg)" }}>
            <LabelValueWithHover
              label=""
              value={signal === '-' ? signal : `b'${signal}`}
              decimal={signal.match(/[-X]/) ? signal : binaryToInt(signal)}
              binary={signal}
              hex={signal.match(/[-X]/) ? signal : parseInt(signal, 2).toString(16).toUpperCase()}
              input={false}
              positionClassName=""
            />
          </div>
        )}
      </div>

      <Handle type="target" position={Position.Top} id="adder4" className="input" style={{ left: "4rem", top: "2.6rem" }} />
      <Handle type="target" position={Position.Top} id="alu" className="input" style={{ left: "0rem", top: "2.6rem" }} />
      <Handle type="target" id="bu" position={Position.Right} className="input" style={{ top: "4.5rem", right: "-1.5rem" }} />
      <Handle type="source" position={Position.Bottom} className="output" style={{ top: "5rem" }} />
    </div>
  );
}

export default MuxD;