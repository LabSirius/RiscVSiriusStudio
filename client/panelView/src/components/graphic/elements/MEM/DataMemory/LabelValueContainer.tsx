import { useEffect, useState } from "react";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import { binaryToHex, binaryToInt } from "@/utils/handlerConversions";
import LabelValueWithHover from "@/components/graphic/elements/LabelValueWithHover";

const DMCtrol: Record<string, string> = {
  "000": "8 bits",
  "001": "16 bits",
  "010": "32 bits",
};

const LabelValueContainer = () => {
  const { currentType, currentResult } = useCurrentInst();

  const [addressHex, setAddressHex] = useState("");
  const [addressBin, setAddressBin] = useState("");
  const [addressDec, setAddressDec] = useState("");

  const [dataWrHex, setDataWrHex] = useState("");
  const [dataWrBin, setDataWrBin] = useState("");
  const [dataWrDec, setDataWrDec] = useState("");

  const [dataRdHex, setDataRdHex] = useState("");
  const [dataRdBin, setDataRdBin] = useState("");
  const [dataRdDec, setDataRdDec] = useState("");

  const [writeSignal, setWriteSignal] = useState("");
  const [controlSignal, setControlSignal] = useState("");

  useEffect(() => {
    if (currentResult?.dm) {
      const addr = currentResult.dm.address;
      const wr = currentResult.dm.dataWr;
      const rd = currentResult.dm.dataRd;

      setAddressHex(binaryToHex(addr).toUpperCase());
      setAddressBin(addr);
      setAddressDec(binaryToInt(addr));

      setDataWrHex(binaryToHex(wr).toUpperCase());
      setDataWrBin(wr);
      setDataWrDec(binaryToInt(wr));

      setDataRdHex(binaryToHex(rd).toUpperCase());
      setDataRdBin(rd);
      setDataRdDec(binaryToInt(rd));

      setWriteSignal(currentResult.dm.writeSignal);
      setControlSignal(currentResult.dm.controlSignal);
    }
  }, [currentResult]);

  const isX = (val: string) => val.toUpperCase() === "X";
  const isXXX = (val: string) => val.toUpperCase() === "XXX";

  const controlSignalDesc = DMCtrol[controlSignal];

  return (
    <>
      {/* Address */}
      {["S", "L"].includes(currentType) && (
        <>
          <LabelValueWithHover
            label="Address"
            value={`h'${addressHex}`}
            decimal={addressDec}
            binary={addressBin}
            hex={addressHex}
            positionClassName="absolute top-[6rem] left-[.8rem]"
          />

          {/* Write Signal */}
          <LabelValueWithHover
            label=""
            value={`b'${writeSignal}`}
            decimal={isX(writeSignal) ? `${writeSignal}` : binaryToInt(writeSignal)}
            binary={writeSignal}
            hex={
              isX(writeSignal)
                ? `${writeSignal}`
                : parseInt(writeSignal, 2).toString(16).toUpperCase()
            }
            positionClassName="absolute top-[-8.55rem] left-[4.2rem]"
            input={false}
            operation={writeSignal === "1" ? "Write ✅" : "No Write ❌"}
          />

          {/* Control Signal */}
          <LabelValueWithHover
            label=""
            value={`b'${controlSignal}`}
            decimal={isXXX(controlSignal) ? `${controlSignal}` : binaryToInt(controlSignal)}
            binary={controlSignal}
            hex={
              isXXX(controlSignal)
                ? `${controlSignal}`
                : parseInt(controlSignal, 2).toString(16).toUpperCase()
            }
            positionClassName="absolute top-[-8.55rem] right-[3.6rem]"
            input={false}
            operation={controlSignalDesc}
            dmCtrl={true}
          />
        </>
      )}

      {/* Data Write */}
      {currentType === "S" && (
        <LabelValueWithHover
          label="DataWr"
          value={`h'${dataWrHex}`}
          decimal={dataWrDec}
          binary={dataWrBin}
          hex={dataWrHex}
          positionClassName="absolute top-[13.5rem] left-[.8rem]"
        />
      )}

      {/* Data Read */}
      {currentType === "L" && (
        <LabelValueWithHover
          label="DataRd"
          value={`h'${dataRdHex}`}
          decimal={dataRdDec}
          binary={dataRdBin}
          hex={dataRdHex}
          positionClassName="absolute top-[10.5rem] right-[.8rem]"
          input={false}
        />
      )}
    </>
  );
};

export default LabelValueContainer;
