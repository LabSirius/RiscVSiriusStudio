import { useEffect, useState } from "react";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import { useSimulator } from "@/context/shared/SimulatorContext"; 
import LabelValueWithHover from "@/components/graphic/elements/LabelValueWithHover";
import { binaryToHex, binaryToInt } from "@/utils/handlerConversions";

const LabelValueContainer = () => {
  const { currentType, currentMonocycleResult, pipelineValuesStages } = useCurrentInst();
  const { typeSimulator } = useSimulator(); 

  const [immHex, setImmHex] = useState("");
  const [immBin, setImmBin] = useState("");
  const [immDec, setImmDec] = useState("");

  const [signalHex, setSignalHex] = useState("");
  const [signalBin, setSignalBin] = useState("");
  const [signalDec, setSignalDec] = useState("");

  const [activeInstructionType, setActiveInstructionType] = useState("");

  useEffect(() => {
    if (typeSimulator === 'monocycle') {
      setActiveInstructionType(currentType); 
      if (currentMonocycleResult && currentMonocycleResult.imm) {
        const output = currentMonocycleResult.imm.output;
        const signal = currentMonocycleResult.imm.signal;

        setImmBin(output);
        setImmHex(binaryToHex(output).toUpperCase());
        setImmDec(binaryToInt(output));

        setSignalBin(signal);
        setSignalHex(binaryToHex(signal).toUpperCase());
        setSignalDec(binaryToInt(signal));
      }
    }
  }, [currentMonocycleResult, currentType, typeSimulator]);

  useEffect(() => {
    if (typeSimulator === 'pipeline') {
      const idStage = pipelineValuesStages?.ID;
      
      if (idStage?.instruction?.pc !== -1) {
        setActiveInstructionType(idStage.instruction.type!);

        const output = idStage.ImmExt;
        const signal = idStage.ImmSRC;

        setImmBin(output);
        setImmHex(binaryToHex(output).toUpperCase());
        setImmDec(binaryToInt(output));

        setSignalBin(signal);
        setSignalHex(parseInt(signal, 2).toString(16).toUpperCase());
        setSignalDec(binaryToInt(signal));
      } else {
        setImmBin("");
        setSignalBin("");
        setActiveInstructionType("");
      }
    }
  }, [pipelineValuesStages, typeSimulator]);

  return (
    <>
      {activeInstructionType && activeInstructionType !== "R" && (
        <>
          <LabelValueWithHover
            label="Imm"
            value={`h'${immHex}`}
            decimal={immDec}
            binary={immBin}
            hex={immHex}
            positionClassName="top-[3rem] right-[.8rem]"
            input={false}
          />

          <LabelValueWithHover
            label=""
            value={`b'${signalBin}`}
            decimal={signalDec}
            binary={signalBin}
            hex={signalHex}
            positionClassName="bottom-[1.2rem] left-[.8rem]"
          />
        </>
      )}
    </>
  );
};

export default LabelValueContainer;