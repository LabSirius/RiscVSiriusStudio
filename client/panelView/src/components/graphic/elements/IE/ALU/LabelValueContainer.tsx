import { useEffect, useState } from "react";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import LabelValue from "@/components/graphic/LabelValue";
import { binaryToHex } from "@/utils/handlerConversions";

const LabelValueContainer = () => {
  const { currentInst, currentResult } = useCurrentInst();

  const [hexA, setHexA] = useState("");
  const [hexB, setHexB] = useState("");
  const [hexRes, setHexRes] = useState("");

  useEffect(() => {
    if (currentResult && currentResult.alu) {
      setHexA(binaryToHex(currentResult.alu.a).toUpperCase());
      setHexB(binaryToHex(currentResult.alu.b).toUpperCase());
      setHexRes(binaryToHex(currentResult.alu.result).toUpperCase());
    }
  }, [currentInst, currentResult]);

  return (
    <>
      <div className="absolute top-[1.4rem] left-[.8rem]">
        {!(currentInst.type === "LUI") && <LabelValue label="A" value={`h'${hexA}`} />}
      </div>

      <div className="absolute top-[11.4rem] left-[.8rem]">
        <LabelValue label="B" value={`h'${hexB}`} />
      </div>

      <div className="absolute top-[6.8rem] right-[.8rem]">
        <LabelValue label="ALURes" input={false} value={`h'${hexRes}`} />
      </div>

      <div className="absolute bottom-[-6rem] right-[0]">
        <LabelValue label="" input={false} value={`b'${currentResult.alu.operation}`} />
      </div>
    </>
  );
};

export default LabelValueContainer;
