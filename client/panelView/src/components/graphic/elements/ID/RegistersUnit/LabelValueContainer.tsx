import { useEffect, useState } from 'react';
import { useCurrentInst } from '@/context/graphic/CurrentInstContext';
import LabelValueWithHover from '../../LabelValueWithHover';
import { binaryToInt, binaryToHex } from '@/utils/handlerConversions';

const LabelValueContainer = () => {
  const { currentType, currentInst, currentResult } = useCurrentInst();

  const [ruRs1Hex, setRuRs1Hex] = useState('');
  const [ruRs1Bin, setRuRs1Bin] = useState('');
  const [ruRs1Dec, setRuRs1Dec] = useState('');

  const [ruRs2Hex, setRuRs2Hex] = useState('');
  const [ruRs2Bin, setRuRs2Bin] = useState('');
  const [ruRs2Dec, setRuRs2Dec] = useState('');

  const [dataWriteHex, setDataWriteHex] = useState('');
  const [dataWriteBin, setDataWriteBin] = useState('');
  const [dataWriteDec, setDataWriteDec] = useState('');

  useEffect(() => {
    if (currentResult?.ru) {

      const rs1 = currentResult.ru.rs1;
      const rs2 = currentResult.ru.rs2;
      const data = currentResult.ru.dataWrite;

      setRuRs1Hex(binaryToHex(rs1).toUpperCase());
      setRuRs1Bin(rs1);
      setRuRs1Dec(binaryToInt(rs1));

      setRuRs2Hex(binaryToHex(rs2).toUpperCase());
      setRuRs2Bin(rs2);
      setRuRs2Dec(binaryToInt(rs2));

      setDataWriteHex(binaryToHex(data).toUpperCase());
      setDataWriteBin(data);
      setDataWriteDec(binaryToInt(data));
    }
  }, [currentResult]);

  const writeSignal = currentResult.ru.writeSignal;

  return (
    <>
      {!(currentType === 'J' || currentType === 'LUI' || currentType === 'AUIPC') && (
        <LabelValueWithHover
          label=""
          value={`b'${currentInst.encoding.rs1}`}
          decimal={binaryToInt(currentInst.encoding.rs1 || '')}
          binary={currentInst.encoding.rs1 || ''}
          hex={parseInt(currentInst.encoding.rs1 || '', 2).toString(16).toUpperCase()}
          positionClassName="top-[1.4rem] left-[.8rem]"
        />
      )}

      {/* RS2 */}
      {(currentType === 'R' || currentType === 'S' || currentType === 'B') && (
        <LabelValueWithHover
          label=""
          value={`b'${currentInst.encoding.rs2}`}
          decimal={binaryToInt(currentInst.encoding.rs2 || '')}
          binary={currentInst.encoding.rs2 || ''}
          hex={parseInt(currentInst.encoding.rs2!, 2).toString(16).toUpperCase()}
          positionClassName="top-[6.6rem] left-[.8rem]"
        />
      )}

      {/* RD */}
      {!(currentType === 'S' || currentType === 'B') && (
        <LabelValueWithHover
          label=""
          value={`b'${currentInst.encoding.rd}`}
          decimal={binaryToInt(currentInst.encoding.rd || '')}
          binary={currentInst.encoding.rd || ''}
          hex={parseInt(currentInst.encoding.rd || '', 2).toString(16).toUpperCase()}
          positionClassName="top-[12rem] left-[.8rem]"
        />
      )}

      {/* RU[xRS1] */}
      {!(currentType === 'J' || currentType === 'LUI' || currentType === 'AUIPC') && (
        <LabelValueWithHover
          label={`RU[x${currentInst.rs1?.regenc}]`}
          value={`h'${ruRs1Hex}`}
          decimal={ruRs1Dec}
          binary={ruRs1Bin}
          hex={ruRs1Hex}
          positionClassName="top-[1rem] right-[.8rem]"
          input={false}
        />
      )}

      {/* RU[xRS2] */}
      {(currentType === 'R' || currentType === 'S' || currentType === 'B') && (
        <LabelValueWithHover
          label={`RU[x${currentInst.rs2?.regenc}]`}
          value={`h'${ruRs2Hex}`}
          decimal={ruRs2Dec}
          binary={ruRs2Bin}
          hex={ruRs2Hex}
          positionClassName="top-[9.2rem] right-[.8rem]"
          input={false}
        />
      )}

      {/* DataWr */}
      {!(currentType === 'S' || currentType === 'B') && (
        <LabelValueWithHover
          label="DataWr"
          value={`h'${dataWriteHex}`}
          decimal={dataWriteDec}
          binary={dataWriteBin}
          hex={dataWriteHex}
          positionClassName="top-[16rem] left-[.8rem]"
        />
      )}

      {/* Write signal */}
      <LabelValueWithHover
        label=""
        value={`b'${writeSignal}`}
        decimal={writeSignal}
        binary={writeSignal}
        hex={writeSignal}
        positionClassName="bottom-[2.2rem] left-[.8rem]"
      />
    </>
  );
};

export default LabelValueContainer;
