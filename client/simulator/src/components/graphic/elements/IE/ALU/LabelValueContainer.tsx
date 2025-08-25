import { useEffect, useState } from "react";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import LabelValueWithHover from "@/components/graphic/elements/LabelValueWithHover";
import { binaryToHex, binaryToInt } from "@/utils/handlerConversions";
import { useMemoryTable } from "@/context/shared/MemoryTableContext";
import { useSimulator } from "@/context/shared/SimulatorContext";

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
  const { currentType, currentMonocycleResult, pipelineValuesStages } = useCurrentInst();
  const { typeSimulator } = useSimulator();
  const { setReadInMemory } = useMemoryTable();

  const [aHex, setAHex] = useState(""); const [aBin, setABin] = useState(""); const [aDec, setADec] = useState("");
  const [bHex, setBHex] = useState(""); const [bBin, setBBin] = useState(""); const [bDec, setBDec] = useState("");
  const [resHex, setResHex] = useState(""); const [resBin, setResBin] = useState(""); const [resDec, setResDec] = useState("");
  const [aluOp, setAluOp] = useState("");
  const [operationDescription, setOperationDescription] = useState("");
  const [activeInstructionType, setActiveInstructionType] = useState("");

  useEffect(() => {
    const setNopValues = () => {
      setABin("--"); setBBin("--"); setResBin("--");
      setAHex("--"); setBHex("--"); setResHex("--");
      setADec("--"); setBDec("--"); setResDec("--");
      setAluOp("-----"); setOperationDescription("");
      setActiveInstructionType("");
    };

    if (typeSimulator === 'pipeline') {
      const exStage = pipelineValuesStages?.EX;
      if (exStage?.instruction?.pc === -1) {
        setNopValues();
      } else if (exStage) {
        setActiveInstructionType(exStage.instruction.type!);
        const { ALUInputA: a, ALUInputB: b, ALURes: res, ALUOp: op } = exStage;

        setABin(a); setAHex(binaryToHex(a).toUpperCase()); setADec(binaryToInt(a));
        setBBin(b); setBHex(binaryToHex(b).toUpperCase()); setBDec(binaryToInt(b));
        setResBin(res); setResHex(binaryToHex(res).toUpperCase()); setResDec(binaryToInt(res));
        setAluOp(op); setOperationDescription(aluOperations[op]);
      }
    } else { 
      setActiveInstructionType(currentType);
      if (currentMonocycleResult?.alu) {
        const { a, b, result: res, operation: op } = currentMonocycleResult.alu;

        setABin(a); setAHex(binaryToHex(a).toUpperCase()); setADec(binaryToInt(a));
        setBBin(b); setBHex(binaryToHex(b).toUpperCase()); setBDec(binaryToInt(b));
        setResBin(res); setResHex(binaryToHex(res).toUpperCase()); setResDec(binaryToInt(res));
        setAluOp(op); setOperationDescription(aluOperations[op]);
      }
    }
  }, [typeSimulator, currentMonocycleResult, pipelineValuesStages, currentType]);

  const handleMemoryClick = () => {
    let instruction, resultDecimal, dmCtrl;
    if (typeSimulator === 'pipeline') {
      const exStage = pipelineValuesStages?.EX;
      if (!exStage) return;
      instruction = exStage.instruction;
      resultDecimal = exStage.ALURes ? binaryToInt(exStage.ALURes).toString() : "0";
      dmCtrl = exStage.DMCtrl;
    } else {
      instruction = { type: currentType };
      resultDecimal = resDec;
      dmCtrl = currentMonocycleResult?.dm?.controlSignal;
    }
    
    if (instruction?.type === "S" || instruction?.type === "L") {
      setReadInMemory({
        address: parseInt(resultDecimal, 10),
        _length: dmCtrl === "000" ? 1 : dmCtrl === "001" ? 2 : 4,
        value: "1"
      });
    }
  };

  return (
    <>
      {/* A */}
      {activeInstructionType !== "LUI" && (
        <LabelValueWithHover label="A" value={`h'${aHex}`} decimal={aDec} binary={aBin} hex={aHex} positionClassName="top-[3.4rem] left-[.8rem]" />
      )}

      {/* B */}
      <LabelValueWithHover label="B" value={`h'${bHex}`} decimal={bDec} binary={bBin} hex={bHex} positionClassName="top-[13.9rem] left-[.8rem]" />

      <div className="z-1000" onClick={handleMemoryClick}>
        {/* ALU Result */}
        <LabelValueWithHover label="ALURes" value={`h'${resHex}`} decimal={resDec} binary={resBin} hex={resHex} input={false} positionClassName="top-[9.8rem] right-[.8rem]" />
      </div>
      
      {/* ALU operation code */}
      <LabelValueWithHover label="" value={aluOp.includes('-') ? aluOp : `b'${aluOp}`} decimal={binaryToInt(aluOp)} binary={aluOp} hex={parseInt(aluOp, 2).toString(16).toUpperCase()} input={false} positionClassName="bottom-[-6rem] right-[-.8rem]" />

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