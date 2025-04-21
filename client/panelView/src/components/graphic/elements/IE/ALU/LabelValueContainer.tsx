import { useEffect, useState } from "react";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import LabelValueWithHover from "@/components/graphic/elements/LabelValueWithHover";
import { binaryToHex, binaryToInt } from "@/utils/handlerConversions";

const LabelValueContainer = () => {
  const { currentType, currentResult } = useCurrentInst();

  const [aHex, setAHex] = useState("");
  const [aBin, setABin] = useState("");
  const [aDec, setADec] = useState("");

  const [bHex, setBHex] = useState("");
  const [bBin, setBBin] = useState("");
  const [bDec, setBDec] = useState("");

  const [resHex, setResHex] = useState("");
  const [resBin, setResBin] = useState("");
  const [resDec, setResDec] = useState("");

  useEffect(() => {
    if (currentResult?.alu) {
      const a = currentResult.alu.a;
      const b = currentResult.alu.b;
      const res = currentResult.alu.result;

      setAHex(binaryToHex(a).toUpperCase());
      setABin(a);
      setADec(binaryToInt(a));

      setBHex(binaryToHex(b).toUpperCase());
      setBBin(b);
      setBDec(binaryToInt(b));

      setResHex(binaryToHex(res).toUpperCase());
      setResBin(res);
      setResDec(binaryToInt(res));
    }
  }, [currentResult]);

  return (
    <>
      {/* A */}
      {!(currentType === "LUI") && (
        <LabelValueWithHover
          label="A"
          value={`h'${aHex}`}
          decimal={aDec}
          binary={aBin}
          hex={aHex}
          positionClassName="top-[1.4rem] left-[.8rem]"
        />
      )}

      {/* B */}
      <LabelValueWithHover
        label="B"
        value={`h'${bHex}`}
        decimal={bDec}
        binary={bBin}
        hex={bHex}
        positionClassName="top-[11.4rem] left-[.8rem]"
      />

      {/* ALU Result */}
      <LabelValueWithHover
        label="ALURes"
        value={`h'${resHex}`}
        decimal={resDec}
        binary={resBin}
        hex={resHex}
        input={false}
        positionClassName="top-[6.8rem] right-[.8rem]"
      />

      {/* ALU operation code (raw binary) */}
      <LabelValueWithHover
        label=""
        value={`b'${currentResult.alu.operation}`}
        decimal={binaryToInt(currentResult.alu.operation)}
        binary={currentResult.alu.operation}
        hex={parseInt(currentResult.alu.operation, 2).toString(16).toUpperCase()}
        input={false}
        positionClassName="bottom-[-6rem] right-[0]"
        aluOp={currentResult.alu.operation}
      />
    </>
  );
};

export default LabelValueContainer;
