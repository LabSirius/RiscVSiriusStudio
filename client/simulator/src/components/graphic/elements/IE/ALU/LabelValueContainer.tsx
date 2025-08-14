import { useEffect, useState } from "react";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import LabelValueWithHover from "@/components/graphic/elements/LabelValueWithHover";
import { binaryToHex, binaryToInt } from "@/utils/handlerConversions";
import { useMemoryTable } from "@/context/shared/MemoryTableContext";

const aluOperations: Record<string, string> = {
  "0000": "+",
  "00000": "+",

  "1000": "-",
  "01000": "-",

  "0100": "⊕",
  "00100": "⊕",

  "0110": "|",
  "00110": "|",

  "0111": "&",
  "00111": "&",

  "0001": "<<",
  "00001": "<<",

  "0101": ">>",
  "00101": ">>",

  "1101": ">> (msb ext)",
  "01101": ">> (msb ext)",

  "0010": "<",
  "00010": "<",

  "0011": "< (U)",
  "00011": "< (U)",

  "10000": "*",
  "10001": "* (S)",
  "10010": "* (S*U)",
  "10011": "* (U)",
  "10100": "÷ (S)",
  "10101": "÷ (U)",
  "10110": "% (S)",
  "10111": "% (U)",
};

const LabelValueContainer = () => {
  const { currentType, currentResult } = useCurrentInst();
  const { setReadInMemory } = useMemoryTable();


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
          positionClassName="top-[3.4rem] left-[.8rem]"
        />
      )}

      {/* B */}
      <LabelValueWithHover
        label="B"
        value={`h'${bHex}`}
        decimal={bDec}
        binary={bBin}
        hex={bHex}
        positionClassName="top-[13.9rem] left-[.8rem]"
      />

      <div className="z-1000" onClick={() => {
        if(currentType === "S" || currentType === "L"){
          setReadInMemory({
            address: parseInt(resDec, 10),
            _length:  currentResult.dm.controlSignal === "000" ? 1 : currentResult.dm.controlSignal === "001" ? 2 : 4,
            value: "1"
          })
        }
      }}>


        {/* ALU Result */}
      <LabelValueWithHover
        label="ALURes"
        value={`h'${resHex}`}
        decimal={resDec}
        binary={resBin}
        hex={resHex}
        input={false}
        positionClassName="top-[9.8rem] right-[.8rem]"
      />

      </div>
      

      {/* ALU operation code (with description) */}
      <LabelValueWithHover
        label=""
        value={`b'${aluOp}`}
        decimal={binaryToInt(aluOp)}
        binary={aluOp}
        hex={parseInt(aluOp, 2).toString(16).toUpperCase()}
        input={false}
        positionClassName="bottom-[-6rem] right-[-.8rem]"
      />

      {operationDescription && (
        <div className="absolute text-black transform z-1000 top-[52%] left-[13%] -translate-x-[13%] -translate-y-[50%] text-center">
          <p className="text-[2.2rem]">
            <span>{operationDescription.split(" ")[0]}</span>
            {operationDescription.includes("(") && (
              <span className="text-[1.5rem] text-[#777777] ml-2">
                {operationDescription.slice(operationDescription.indexOf("("))}
              </span>
            )}
          </p>
        </div>
      )}
    </>
  );
};

export default LabelValueContainer;
