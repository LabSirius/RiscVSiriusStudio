import { useEffect, useState } from "react";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import LabelValueWithHover from "@/components/graphic/elements/LabelValueWithHover";
import { binaryToHex, binaryToInt } from "@/utils/handlerConversions";


const aluOperations: Record<string, string> = {
  // Operaciones clásicas (4 o 5 bits según el caso)
  "0000": "A + B",
  "00000": "A + B",

  "1000": "A - B",
  "01000": "A - B",

  "0100": "A ⊕ B",
  "00100": "A ⊕ B",

  "0110": "A | B",
  "00110": "A | B",

  "0111": "A & B",
  "00111": "A & B",

  "0001": "A << B",
  "00001": "A << B",

  "0101": "A >> B",
  "00101": "A >> B",

  "1101": "A >> B (Arithmetic)",
  "01101": "A >> B (Arithmetic)",

  "0010": "A < B (Unsigned)",
  "00010": "A < B (Unsigned)",

  "0011": "A < B (Signed)",
  "00011": "A < B (Signed)",

  "10000": "A * B",
  "10001": "High bits of A * B (Signed)",
  "10010": "High bits of A * B (Signed × Unsigned)",
  "10011": "High bits of A * B (Unsigned)",
  "10100": "A ÷ B (Signed)",
  "10101": "A ÷ B (Unsigned)",
  "10110": "A % B (Signed)",
  "10111": "A % B (Unsigned)",
};

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

  const aluOp = currentResult?.alu?.operation ?? "";
  const operationDescription = aluOperations[aluOp];




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

      {/* ALU operation code (with description) */}
      <LabelValueWithHover
        label=""
        value={`b'${aluOp}`}
        decimal={binaryToInt(aluOp)}
        binary={aluOp}
        hex={parseInt(aluOp, 2).toString(16).toUpperCase()}
        input={false}
        positionClassName="bottom-[-6rem] right-[0]"

      />

      <p className="absolute bottom-[1rem] left-[50%] transform -translate-x-[50%] z-1000 text-xl text-black">{operationDescription}</p>
    </>
  );
};

export default LabelValueContainer;
