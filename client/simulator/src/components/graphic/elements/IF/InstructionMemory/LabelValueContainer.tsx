import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import { binaryToHex, binaryToInt } from "@/utils/handlerConversions";
import LabelValueWithHover from "../../LabelValueWithHover";
import { useSimulator } from "@/context/shared/SimulatorContext";

const LabelValueContainer = () => {
  const { currentMonocycletInst, pipelineValuesStages } = useCurrentInst();
  const { typeSimulator } = useSimulator();

  let decAddress = "--", binAddress = "--", hexAddress = "--";
  let decInstruction = "--", binInstruction = "--", hexInstruction = "--";

  if (typeSimulator === "monocycle") {
    if (currentMonocycletInst) {
      const addressValue = currentMonocycletInst.currentPc * 4;
      binAddress = addressValue.toString(2).padStart(32, "0");
      decAddress = addressValue.toString();
      hexAddress = binaryToHex(binAddress).toUpperCase();

      hexInstruction = currentMonocycletInst.encoding.hexEncoding.toUpperCase();
      binInstruction = currentMonocycletInst.encoding.binEncoding;
      decInstruction = binaryToInt(binInstruction).toString();
    }
  } else {

    if (pipelineValuesStages) {

      const instructionInIF = pipelineValuesStages.IF.instruction;

      if (instructionInIF && instructionInIF.pc !== -1) {
        const addressValue = pipelineValuesStages.ID.PC;
        binAddress = addressValue.toString(2).padStart(32, "0");
        decAddress = addressValue.toString();
        hexAddress = binaryToHex(binAddress).toUpperCase();

        const parsedInst = instructionInIF
        if (parsedInst.encoding) {
          hexInstruction = parsedInst.encoding.hexEncoding.toUpperCase();
          binInstruction = parsedInst.encoding.binEncoding;
          decInstruction = binaryToInt(binInstruction).toString();
        }
      }
    }
  }

  return (
    <>
      <LabelValueWithHover
        label="Address"
        value={`h'${hexAddress}`}
        decimal={decAddress}
        binary={binAddress}
        hex={hexAddress}
        positionClassName="top-[24%] left-[.8rem]"
      />

      <LabelValueWithHover
        label="Instruction"
        value={`h'${hexInstruction}`}
        decimal={decInstruction}
        binary={binInstruction}
        hex={hexInstruction}
        positionClassName="top-[8rem] right-[.8rem]"
        input={false}
      />
    </>
  );
};

export default LabelValueContainer;