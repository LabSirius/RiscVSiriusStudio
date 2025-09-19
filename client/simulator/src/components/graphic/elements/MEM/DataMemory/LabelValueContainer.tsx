import { useEffect, useState } from "react";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import { useSimulator } from "@/context/shared/SimulatorContext"; 
import { binaryToHex, binaryToInt } from "@/utils/handlerConversions";
import LabelValueWithHover from "@/components/graphic/elements/LabelValueWithHover";
import { useMemoryTable } from "@/context/shared/MemoryTableContext";

const DMCtrol: Record<string, string> = {
  "000": "8 bits", "001": "16 bits", "010": "32 bits",
};

const LabelValueContainer = () => {
  const { currentType, currentMonocycleResult, pipelineValuesStages } = useCurrentInst();
  const { typeSimulator } = useSimulator();
  const { setReadInMemory } = useMemoryTable();

  const [addressHex, setAddressHex] = useState(""); const [addressBin, setAddressBin] = useState(""); const [addressDec, setAddressDec] = useState("");
  const [dataWrHex, setDataWrHex] = useState(""); const [dataWrBin, setDataWrBin] = useState(""); const [dataWrDec, setDataWrDec] = useState("");
  const [dataRdHex, setDataRdHex] = useState(""); const [dataRdBin, setDataRdBin] = useState(""); const [dataRdDec, setDataRdDec] = useState("");
  const [writeSignal, setWriteSignal] = useState("");
  const [controlSignal, setControlSignal] = useState("");

  const [showComponent, setShowComponent] = useState(false);
  const [showWriteData, setShowWriteData] = useState(false);
  const [showReadData, setShowReadData] = useState(false);

  useEffect(() => {

    if (typeSimulator === 'pipeline') {
      const memStage = pipelineValuesStages?.MEM;
      if (memStage?.instruction) {
        if (memStage.instruction.pc === -1) {
          // --- Caso 1: Es un NOP ---
          setShowComponent(true); setShowWriteData(true); setShowReadData(true);
          setAddressBin('--'); setAddressHex('--'); setAddressDec('--');
          setDataWrBin('--'); setDataWrHex('--'); setDataWrDec('--');
          setDataRdBin('--'); setDataRdHex('--'); setDataRdDec('--');
          setWriteSignal('-'); setControlSignal('---');
        } else {
          const isLoad = memStage.RUDataWrSrc === '01';
          const isStore = memStage.DMWr;

          setShowComponent(isLoad || isStore);
          setShowWriteData(isStore);
          setShowReadData(isLoad);

          if (isLoad || isStore) {
            const { Address: addr, MemWriteData: wr, MemReadData: rd, DMWr: ws, DMCtrl: cs } = memStage;
            setAddressBin(addr); setAddressHex(binaryToHex(addr).toUpperCase()); setAddressDec(binaryToInt(addr));
            setDataWrBin(wr); setDataWrHex(binaryToHex(wr).toUpperCase()); setDataWrDec(binaryToInt(wr));
            setDataRdBin(rd); setDataRdHex(binaryToHex(rd).toUpperCase()); setDataRdDec(binaryToInt(rd));
            setWriteSignal(ws ? '1' : '0');
            setControlSignal(cs);
          }
        }
      }
    } else {
      setShowComponent(["S", "L"].includes(currentType));
      setShowWriteData(currentType === "S");
      setShowReadData(currentType === "L");
      if (currentMonocycleResult?.dm) {
        const { address: addr, dataWr: wr, dataRd: rd, writeSignal: ws, controlSignal: cs } = currentMonocycleResult.dm;
        setAddressHex(binaryToHex(addr).toUpperCase()); setAddressBin(addr); setAddressDec(binaryToInt(addr));
        setDataWrHex(binaryToHex(wr).toUpperCase()); setDataWrBin(wr); setDataWrDec(binaryToInt(wr));
        setDataRdHex(binaryToHex(rd).toUpperCase()); setDataRdBin(rd); setDataRdDec(binaryToInt(rd));
        setWriteSignal(ws); setControlSignal(cs);
      }
    }
  }, [typeSimulator, currentMonocycleResult, pipelineValuesStages, currentType]);

  const handleMemoryClick = () => {
    let addrDec, ctrlSignal;
    if (typeSimulator === 'pipeline') {
      addrDec = pipelineValuesStages?.MEM?.Address ? binaryToInt(pipelineValuesStages.MEM.Address).toString() : "0";
      ctrlSignal = pipelineValuesStages?.MEM?.DMCtrl;
    } else {
      addrDec = addressDec;
      ctrlSignal = controlSignal;
    }
    setReadInMemory({
      address: parseInt(addrDec, 10),
      _length: ctrlSignal === "000" ? 1 : ctrlSignal === "001" ? 2 : 4,
      value: "1"
    });
  };

  const controlSignalDesc = DMCtrol[controlSignal];

  return (
    <>
      {showComponent && (
        <>
          <div className="z-1000" onClick={handleMemoryClick}>
            <LabelValueWithHover label="Address" value={addressBin.includes('-') ? addressBin : `h'${addressHex}`} decimal={addressDec} binary={addressBin} hex={addressHex} positionClassName="absolute top-[6rem] left-[.8rem]" />
          </div>
          
          <LabelValueWithHover label="" value={writeSignal === '-' ? writeSignal : `b'${writeSignal}`} decimal={writeSignal} binary={writeSignal} hex={writeSignal} positionClassName="absolute top-[-8.55rem] left-[4.2rem]" input={false} operation={writeSignal === "1" ? "Write ✅" : writeSignal === "0" ? "No Write ❌" : ""} />
          <LabelValueWithHover label="" value={controlSignal.includes('-') ? controlSignal : `b'${controlSignal}`} decimal={controlSignal} binary={controlSignal} hex={controlSignal} positionClassName="absolute top-[-8.55rem] right-[3.6rem]" input={false} operation={controlSignalDesc} dmCtrl={true} />
        </>
      )}

      {showWriteData && (
        <LabelValueWithHover label="DataWr" value={dataWrBin.includes('-') ? dataWrBin : `h'${dataWrHex}`} decimal={dataWrDec} binary={dataWrBin} hex={dataWrHex} positionClassName="absolute top-[13.5rem] left-[.8rem]" />
      )}

      {showReadData && (
        <LabelValueWithHover label="DataRd" value={dataRdBin.includes('-') ? dataRdBin : `h'${dataRdHex}`} decimal={dataRdDec} binary={dataRdBin} hex={dataRdHex} positionClassName="absolute top-[10.5rem] right-[.8rem]" input={false} />
      )}
    </>
  );
};

export default LabelValueContainer;