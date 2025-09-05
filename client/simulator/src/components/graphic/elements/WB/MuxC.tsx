import MuxContainer3_1 from "../MUXContainer3_1";
import { Handle, Position } from "@xyflow/react";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import { useSimulator } from "@/context/shared/SimulatorContext";
import LabelValueWithHover from "@/components/graphic/elements/LabelValueWithHover";
import {  binaryToInt } from "@/utils/handlerConversions";

interface HandlerConfig {
  id?: string;
  style: React.CSSProperties;
  position: Position;
}

export default function MuxC() {
  const { currentMonocycleResult, currentType, pipelineValuesStages } = useCurrentInst();
  const { operation, isEbreak, typeSimulator } = useSimulator();

  let signal: string;
  let activeCurrentType: string;

  if (typeSimulator === 'pipeline') {
    const wbStage = pipelineValuesStages?.WB;
      const rawSignal = wbStage?.RUDataWrSrc || 'XX';

    signal = rawSignal === 'XX' ? '-' : rawSignal;
    activeCurrentType = wbStage?.instruction?.type || '';
  } else {
    signal = currentMonocycleResult?.wb?.signal || 'XX';
    activeCurrentType = currentType;
  }

  const hasX = signal.includes('X');
  const signalDec = hasX ? `${signal}` : binaryToInt(signal);
  const signalHex = hasX ? `${signal}` : parseInt(signal, 2).toString(16).toUpperCase();

  const inputHandlers: HandlerConfig[] = [
    { id: "adder4", style: { top: "1.8rem" }, position: Position.Left },
    { id: "dataMemory", style: { top: "4.7rem" }, position: Position.Left },
    { id: "alu", style: { top: "7.5rem" }, position: Position.Left },
    { id: "ruDataWrSrc", style: { top: "7.3rem" }, position: Position.Bottom },
  ];
  const outputHandlers: HandlerConfig[] = [{ style: { right: ".8rem" }, position: Position.Right }];

  return (
    <div className="relative w-full h-full">
      <div className="relative w-full h-full">
        
        
        <MuxContainer3_1  signal={signal} isEbreak={isEbreak}/>
        {(operation !== "uploadMemory" && !(activeCurrentType === "S" || activeCurrentType === "B" ) && !isEbreak) && 
          <div className="absolute bottom-[.3rem] left-[3.5rem]">
            <LabelValueWithHover
              label=""
              value={`b'${signal}`}
              decimal={signalDec}
              binary={signal}
              hex={signalHex}
              input={false}
              positionClassName=""
            />
          </div>
        }
      </div>

      {inputHandlers.map((handler, index) => (
        <Handle key={handler.id || `input-${index}`} type="target" id={handler.id} position={handler.position} className="input" style={handler.style} />
      ))}

      {outputHandlers.map((handler, index) => (
        <Handle key={`output-${index}`} type="source" position={handler.position} className="output" style={handler.style} />
      ))}
    </div>
  );
}