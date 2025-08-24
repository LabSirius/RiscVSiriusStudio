import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import { binaryToHex, binaryToInt } from "@/utils/handlerConversions";
import LabelValueWithHover from "../../LabelValueWithHover";
import { useSimulator } from "@/context/shared/SimulatorContext";

const LabelValueContainer = () => {
  const { currentMonocycleResult, currentMonocycletInst, pipelineValuesStages } = useCurrentInst();
  const { typeSimulator } = useSimulator();

  let pcDec = "--", pcBin = "--", pcHex = "--";
  let nextPcDec = "--", nextPcBin = "--", nextPcHex = "--";
  let displayPC = "--";

  if (typeSimulator === "monocycle") {
    if (currentMonocycletInst) {
      const pcValue = currentMonocycletInst.currentPc;
      pcBin = pcValue.toString(2).padStart(32, "0");
      pcDec = pcValue.toString();
      pcHex = binaryToHex(pcBin).toUpperCase();
      displayPC = `h'${pcHex}`;
    }
    if (currentMonocycleResult?.buMux?.result) {
      const bin = currentMonocycleResult.buMux.result;
      nextPcHex = binaryToHex(bin).toUpperCase();
      nextPcDec = binaryToInt(bin).toString();
      nextPcBin = bin.padStart(32, "0");
    }
  } else {
    if (pipelineValuesStages) {
      const pcValue = pipelineValuesStages.IF.PC;
      if (pcValue >= 0) {
        pcBin = pcValue.toString(2).padStart(32, "0");
        pcDec = pcValue.toString();
        pcHex = binaryToHex(pcBin).toUpperCase();
        displayPC = `h'${pcHex}`;
      }

      const nextPcValue = pipelineValuesStages.IF.PCP4;
      if (nextPcValue >= 0) {
        nextPcBin = nextPcValue.toString(2).padStart(32, "0");
        nextPcDec = nextPcValue.toString();
        nextPcHex = binaryToHex(nextPcBin).toUpperCase();
      }
    }
  }

  return (
    <>
      <LabelValueWithHover
        label="NextPc"
        value={`h'${nextPcHex}`}
        decimal={nextPcDec}
        binary={nextPcBin}
        hex={nextPcHex}
        positionClassName="top-[8rem] left-[.8rem]"
      />

      <LabelValueWithHover
        label="PC"
        value={displayPC}
        decimal={pcDec}
        binary={pcBin}
        hex={pcHex}
        positionClassName="top-[3.2rem] right-[.8rem]"
        input={false}
      />
    </>
  );
};

export default LabelValueContainer;