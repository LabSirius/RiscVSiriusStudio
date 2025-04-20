import { useEffect, useState } from "react";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import { binaryToHex, binaryToInt } from "@/utils/handlerConversions";
import { useFormattedPC } from "@/hooks/graphic/useFormattedPC";
import LabelValueWithHover from "../../LabelValueWithHover";

const LabelValueContainer = () => {
  const { currentResult, currentInst } = useCurrentInst();
  const formattedPC = useFormattedPC(currentInst.currentPc);

  const [hexNextPC, setHexNextPC] = useState("");
  const [decNextPC, setDecNextPC] = useState("");
  const [binNextPC, setBinNextPC] = useState("");

  useEffect(() => {
    if (currentResult?.buMux?.result) {
      const bin = currentResult.buMux.result;
      setHexNextPC(binaryToHex(bin).toUpperCase());
      setDecNextPC(binaryToInt(bin));
      setBinNextPC(bin.padStart(32, "0"));
    }
  }, [currentResult]);

  const pcValue = parseInt(String(currentInst.currentPc), 2) * 4;
  const pcBin = pcValue.toString(2).padStart(32, "0");
  const pcDec = pcValue.toString();
  const pcHex = binaryToHex(pcBin).toUpperCase();

  return (
    <>
      <LabelValueWithHover
        label="NextPc"
        value={`h'${hexNextPC}`}
        decimal={decNextPC}
        binary={binNextPC}
        hex={hexNextPC}
        positionClassName="top-[8rem] left-[.8rem]"
      />

      <LabelValueWithHover
        label="PC"
        value={formattedPC}
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
