import { useEffect, useState } from "react";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import { binaryToHex, binaryToInt } from "@/utils/handlerConversions";
import { useFormattedPC } from "@/hooks/graphic/useFormattedPC";
import LabelValueWithHover from "../../LabelValueWithHover";

const LabelValueContainer = () => {
  const { currentMonocycleResult, currentMonocycletInst } = useCurrentInst();

  
 const formattedPC = useFormattedPC(currentMonocycletInst?.currentPc ?? 0);


  const [hexNextPC, setHexNextPC] = useState("");
  const [decNextPC, setDecNextPC] = useState("");
  const [binNextPC, setBinNextPC] = useState("");

  useEffect(() => {
    if (currentMonocycleResult?.buMux?.result) {
      const bin = currentMonocycleResult.buMux.result;
      setHexNextPC(binaryToHex(bin).toUpperCase());
      setDecNextPC(binaryToInt(bin));
      setBinNextPC(bin.padStart(32, "0"));
    }
  }, [currentMonocycleResult]);

  const pcValue = parseInt(String(currentMonocycletInst?.currentPc), 2) * 4;
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
