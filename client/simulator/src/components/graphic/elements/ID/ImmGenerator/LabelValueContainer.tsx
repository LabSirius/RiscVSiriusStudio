import { useEffect, useState } from "react";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import LabelValueWithHover from "@/components/graphic/elements/LabelValueWithHover";
import { binaryToHex, binaryToInt } from "@/utils/handlerConversions";

const LabelValueContainer = () => {
  const { currentType, currentResult } = useCurrentInst();

  const [immHex, setImmHex] = useState("");
  const [immBin, setImmBin] = useState("");
  const [immDec, setImmDec] = useState("");

  const [signalHex, setSignalHex] = useState("");
  const [signalBin, setSignalBin] = useState("");
  const [signalDec, setSignalDec] = useState("");

  useEffect(() => {
    if (currentResult && currentResult.imm) {
      const output = currentResult.imm.output;
      const signal = currentResult.imm.signal;

      setImmBin(output);
      setImmHex(binaryToHex(output).toUpperCase());
      setImmDec(binaryToInt(output));

      setSignalBin(signal);
      setSignalHex(binaryToHex(signal).toUpperCase());
      setSignalDec(binaryToInt(signal));
    }
  }, [currentResult]);

  return (
    <>
      {/* IMM OUTPUT */}
      {currentType !== "R" && (
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

          {/* IMM SIGNAL */}
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
