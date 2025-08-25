import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import LabelValueWithHover from "../../LabelValueWithHover";
import { binaryToInt, binaryToHex } from "@/utils/handlerConversions";
import { useSimulator } from "@/context/shared/SimulatorContext";
import { ParsedInstruction } from "@/context/graphic/CurrentInstContext";

const LabelValueContainer = () => {
  const { currentMonocycletInst, currentMonocycleResult, pipelineValuesStages } = useCurrentInst();
  const { typeSimulator } = useSimulator();

  const displayData = {
    instructionType: "",
    rs1Address: { bin: "", dec: "", hex: "" },
    rs2Address: { bin: "", dec: "", hex: "" },
    rdAddress: { bin: "", dec: "", hex: "" },
    rs1Value: { bin: "", dec: "", hex: "" },
    rs2Value: { bin: "", dec: "", hex: "" },
    dataWrite: { bin: "", dec: "", hex: "" },
    writeSignal: "",
    rs1Regenc: "",
    rs2Regenc: "",
  };

  let showWriteFields = false;
  let showWriteSignal = false;

  if (typeSimulator === "monocycle") {
    if (currentMonocycletInst && currentMonocycleResult) {
      const inst = currentMonocycletInst;
      const result = currentMonocycleResult;

      displayData.instructionType = inst.type;
      displayData.rs1Regenc = inst.rs1?.regenc ?? "";
      displayData.rs2Regenc = inst.rs2?.regenc ?? "";

      const rs1AddrBin = inst.encoding.rs1 || "";
      if (rs1AddrBin)
        displayData.rs1Address = {
          bin: rs1AddrBin,
          dec: binaryToInt(rs1AddrBin).toString(),
          hex: parseInt(rs1AddrBin, 2).toString(16).toUpperCase(),
        };

      const rs2AddrBin = inst.encoding.rs2 || "";
      if (rs2AddrBin)
        displayData.rs2Address = {
          bin: rs2AddrBin,
          dec: binaryToInt(rs2AddrBin).toString(),
          hex: parseInt(rs2AddrBin, 2).toString(16).toUpperCase(),
        };

      const rdAddrBin = inst.encoding.rd || "";
      if (rdAddrBin)
        displayData.rdAddress = {
          bin: rdAddrBin,
          dec: binaryToInt(rdAddrBin).toString(),
          hex: parseInt(rdAddrBin, 2).toString(16).toUpperCase(),
        };

      const rs1ValBin = result.ru.rs1;
      if (rs1ValBin)
        displayData.rs1Value = {
          bin: rs1ValBin,
          dec: binaryToInt(rs1ValBin).toString(),
          hex: binaryToHex(rs1ValBin).toUpperCase(),
        };

      const rs2ValBin = result.ru.rs2;
      if (rs2ValBin)
        displayData.rs2Value = {
          bin: rs2ValBin,
          dec: binaryToInt(rs2ValBin).toString(),
          hex: binaryToHex(rs2ValBin).toUpperCase(),
        };

      const dataWriteBin = result.ru.dataWrite;
      if (dataWriteBin)
        displayData.dataWrite = {
          bin: dataWriteBin,
          dec: binaryToInt(dataWriteBin).toString(),
          hex: binaryToHex(dataWriteBin).toUpperCase(),
        };

      displayData.writeSignal = result.ru.writeSignal;

      const { instructionType } = displayData;
      showWriteFields = !(instructionType === "S" || instructionType === "B");
      showWriteSignal = true;
    }
  } else {
    if (pipelineValuesStages) {
      const instructionInID = pipelineValuesStages.ID.instruction;
      if (instructionInID && instructionInID.pc !== -1) {
        const parsedInst = instructionInID as ParsedInstruction;

        displayData.instructionType = parsedInst.type;
        displayData.rs1Regenc = parsedInst.rs1?.regenc ?? "";
        displayData.rs2Regenc = parsedInst.rs2?.regenc ?? "";

        const rs1AddrBin = parsedInst.encoding?.rs1 || "";
        if (rs1AddrBin)
          displayData.rs1Address = {
            bin: rs1AddrBin,
            dec: binaryToInt(rs1AddrBin).toString(),
            hex: parseInt(rs1AddrBin, 2).toString(16).toUpperCase(),
          };

        const rs2AddrBin = parsedInst.encoding?.rs2 || "";
        if (rs2AddrBin)
          displayData.rs2Address = {
            bin: rs2AddrBin,
            dec: binaryToInt(rs2AddrBin).toString(),
            hex: parseInt(rs2AddrBin, 2).toString(16).toUpperCase(),
          };

        const rs1ValBin = pipelineValuesStages.ID.RUrs1;
        if (!rs1ValBin.includes("X"))
          displayData.rs1Value = {
            bin: rs1ValBin,
            dec: binaryToInt(rs1ValBin).toString(),
            hex: binaryToHex(rs1ValBin).toUpperCase(),
          };

        const rs2ValBin = pipelineValuesStages.ID.RUrs2;
        if (!rs2ValBin.includes("X"))
          displayData.rs2Value = {
            bin: rs2ValBin,
            dec: binaryToInt(rs2ValBin).toString(),
            hex: binaryToHex(rs2ValBin).toUpperCase(),
          };
      }

      const wbStage = pipelineValuesStages.WB;



      if(instructionInID.pc !== -1 ){
        showWriteSignal = true; 
      }else{
        showWriteSignal = wbStage.RUWr  
      }
      if (wbStage && wbStage.instruction ) {
        displayData.writeSignal = wbStage.RUWr ? "1" : "0";

        if (wbStage.RUWr) {
          const dataWriteBin = wbStage.dataToWrite;
          if (!dataWriteBin.includes("X")) {
            displayData.dataWrite = {
              bin: dataWriteBin,
              dec: binaryToInt(dataWriteBin).toString(),
              hex: binaryToHex(dataWriteBin).toUpperCase(),
            };
          }

          const rdAddrBin = wbStage.instruction.encoding?.rd || "";
          if (rdAddrBin) {
            displayData.rdAddress = {
              bin: rdAddrBin,
              dec: binaryToInt(rdAddrBin).toString(),
              hex: parseInt(rdAddrBin, 2).toString(16).toUpperCase(),
            };
          }
        }

        showWriteFields = wbStage.RUWr;
      }
    }
  }

  const { instructionType } = displayData;
  return (
    <>
      {displayData.rs1Address.bin &&
        !(instructionType === "J" || instructionType === "LUI" || instructionType === "AUIPC") && (
          <LabelValueWithHover
            label=""
            value={`b'${displayData.rs1Address.bin}`}
            decimal={displayData.rs1Address.dec}
            binary={displayData.rs1Address.bin}
            hex={displayData.rs1Address.hex}
            positionClassName="top-[1.4rem] left-[.8rem]"
          />
        )}
      {displayData.rs2Address.bin &&
        (instructionType === "R" || instructionType === "S" || instructionType === "B") && (
          <LabelValueWithHover
            label=""
            value={`b'${displayData.rs2Address.bin}`}
            decimal={displayData.rs2Address.dec}
            binary={displayData.rs2Address.bin}
            hex={displayData.rs2Address.hex}
            positionClassName="top-[6.6rem] left-[.8rem]"
          />
        )}
      {displayData.rdAddress.bin && showWriteFields && (
        <LabelValueWithHover
          label=""
          value={`b'${displayData.rdAddress.bin}`}
          decimal={displayData.rdAddress.dec}
          binary={displayData.rdAddress.bin}
          hex={displayData.rdAddress.hex}
          positionClassName="top-[12rem] left-[.8rem]"
        />
      )}
      {displayData.rs1Value.bin &&
        !(instructionType === "J" || instructionType === "LUI" || instructionType === "AUIPC") && (
          <LabelValueWithHover
            label={`RU[x${displayData.rs1Regenc}]`}
            value={`h'${displayData.rs1Value.hex}`}
            decimal={displayData.rs1Value.dec}
            binary={displayData.rs1Value.bin}
            hex={displayData.rs1Value.hex}
            positionClassName="bottom-[9rem] right-[.8rem]"
            input={false}
          />
        )}
      {displayData.rs2Value.bin &&
        (instructionType === "R" || instructionType === "S" || instructionType === "B") && (
          <LabelValueWithHover
            label={`RU[x${displayData.rs2Regenc}]`}
            value={`h'${displayData.rs2Value.hex}`}
            decimal={displayData.rs2Value.dec}
            binary={displayData.rs2Value.bin}
            hex={displayData.rs2Value.hex}
            positionClassName="bottom-[1.2rem] right-[.8rem]"
            input={false}
          />
        )}
      {displayData.dataWrite.bin && showWriteFields && (
        <LabelValueWithHover
          label="DataWr"
          value={`h'${displayData.dataWrite.hex}`}
          decimal={displayData.dataWrite.dec}
          binary={displayData.dataWrite.bin}
          hex={displayData.dataWrite.hex}
          positionClassName="top-[16rem] left-[.8rem]"
        />
      )}
      {showWriteSignal && (
        <LabelValueWithHover
          label=""
          value={`b'${displayData.writeSignal}`}
          decimal={displayData.writeSignal}
          binary={displayData.writeSignal}
          hex={displayData.writeSignal}
          positionClassName="bottom-[2.2rem] left-[.8rem]"
        />
      )}
    </>
  );
};

export default LabelValueContainer;
