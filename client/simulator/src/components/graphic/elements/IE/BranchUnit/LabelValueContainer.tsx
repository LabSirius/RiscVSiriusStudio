import { useEffect, useState } from "react";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import { useSimulator } from "@/context/shared/SimulatorContext";
import LabelValueWithHover from "@/components/graphic/elements/LabelValueWithHover";
import { binaryToHex, binaryToInt } from "@/utils/handlerConversions";

const branchOperations: Record<string, string> = {
  "01000": "A == B",
  "01001": "A != B",
  "01100": "A < B",
  "01101": "A >= B",
  "01110": "A < B",
  "01111": "A >= B",
  "10XXX": "JALR",
  "11XXX": "JAL",
};

const LabelValueContainer = () => {
  // --- Hooks ---
  const { currentType, currentMonocycleResult, pipelineValuesStages } = useCurrentInst();
  const { typeSimulator } = useSimulator();
  const [hexA, setHexA] = useState("");
  const [decA, setDecA] = useState("");
  const [binA, setBinA] = useState("");
  const [hexB, setHexB] = useState("");
  const [decB, setDecB] = useState("");
  const [binB, setBinB] = useState("");
  const [opHex, setOpHex] = useState("");
  const [opBin, setOpBin] = useState("");
  const [opDec, setOpDec] = useState("");
  const [resHex, setResHex] = useState("");
  const [resBin, setResBin] = useState("");
  const [resDec, setResDec] = useState("");
  const [operationDesc, setOperationDesc] = useState<string | undefined>(undefined);

  const [showInputs, setShowInputs] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showOp, setShowOp] = useState(false);

  useEffect(() => {
    if (typeSimulator === "pipeline") {
      const exStage = pipelineValuesStages?.EX;
      if (exStage?.instruction) {
        if (exStage.instruction.pc === -1) {
          setShowInputs(true);
          setShowResult(true);
          setShowOp(true);
          setBinA("--");
          setBinB("--");
          setResBin("-");
          setHexA("--");
          setHexB("--");
          setResHex("-");
          setDecA("--");
          setDecB("--");
          setResDec("-");
          setOpBin("-----");
          setOpHex("-----");
          setOpDec("-----");
          setOperationDesc(undefined);
        } else {
          const isBranch = exStage.instruction.type === "B" || exStage.instruction.type === "J";

          setShowOp(true);
          setShowResult(true);
          setShowInputs(isBranch);

          const { BrOp: op } = exStage;

          setOpBin(op);
          setOpHex(op.includes("X") ? op : binaryToHex(op).toUpperCase());
          setOpDec(op.includes("X") ? op : binaryToInt(op));
          setOperationDesc(branchOperations[op] || branchOperations[op.substring(0, 2) + "XXX"]);

          const rawResult = exStage.BranchResult;
          const displayResult = rawResult === "X" ? "0" : rawResult;

          setResBin(displayResult);
          setResHex(parseInt(displayResult, 2).toString(16).toUpperCase());
          setResDec(displayResult);

          if (isBranch) {
            const { BranchInputRS1: a, BranchInputRS2: b } = exStage;
            setBinA(a);
            setHexA(binaryToHex(a).toUpperCase());
            setDecA(binaryToInt(a));
            setBinB(b);
            setHexB(binaryToHex(b).toUpperCase());
            setDecB(binaryToInt(b));
          }
        }
      }
    } else {
      setShowOp(true);
      setShowInputs(currentType === "B");
      setShowResult(true);
      if (currentMonocycleResult?.bu) {
        const { a, b, operation: op, result: res } = currentMonocycleResult.bu;
        setHexA(binaryToHex(a).toUpperCase());
        setHexB(binaryToHex(b).toUpperCase());
        setDecA(binaryToInt(a));
        setDecB(binaryToInt(b));
        setBinA(a);
        setBinB(b);
        setOpBin(op);
        if (op.includes("X")) {
          setOpHex(op);
          setOpDec(op);
          setOperationDesc(undefined);
        } else {
          setOpHex(binaryToHex(op).toUpperCase());
          setOpDec(binaryToInt(op));
          setOperationDesc(branchOperations[op]);
        }
        setResHex(binaryToHex(res).toUpperCase());
        setResBin(res);
        setResDec(binaryToInt(res));
      }
    }
  }, [typeSimulator, currentMonocycleResult, pipelineValuesStages, currentType]);

  const showZeroExtend = operationDesc === "01110" || operationDesc === "01111";

  return (
    <>
      {showInputs && (
        <>
          {/* B */}
          <LabelValueWithHover
            label=""
            value={binB.includes("-") ? binB : `h'${hexB}`}
            decimal={decB}
            binary={binB}
            hex={hexB}
            positionClassName="absolute top-[1.2rem] left-[.8rem]"
          />
          {/* A */}
          <LabelValueWithHover
            label=""
            value={binA.includes("-") ? binA : `h'${hexA}`}
            decimal={decA}
            binary={binA}
            hex={hexA}
            positionClassName="absolute top-[5.5rem] left-[.8rem]"
          />
        </>
      )}

      {showOp && (
        <LabelValueWithHover
          label=""
          value={opBin.includes("-") ? opBin : `b'${opBin}`}
          decimal={`${opDec}`}
          binary={opBin}
          hex={`${opHex}`}
          positionClassName="absolute bottom-[-6.43rem] right-[-.8rem]"
          input={false}
          operation={operationDesc}
          showZeroExtend={showZeroExtend}
        />
      )}

      {showResult && (
        <LabelValueWithHover
          label=""
          value={resBin.includes("-") ? resBin : `b'${resBin}`}
          decimal={resDec}
          binary={resBin}
          hex={resHex}
          positionClassName="absolute top-[3.7rem] right-[.8rem]"
          input={false}
        />
      )}
    </>
  );
};

export default LabelValueContainer;
