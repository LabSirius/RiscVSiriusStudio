import { useEffect, useState } from 'react';
import { useCurrentInst } from '@/context/graphic/CurrentInstContext';
import LabelValue from '@/components/graphic/LabelValue';
import { binaryToHex } from '@/utils/handlerConversions';

const LabelValueContainer = () => {
  const { currentType, currentInst, currentResult } = useCurrentInst();

  const [hexRU_RS1, setHexRU_RS1] = useState('');
  const [hexRU_RS2, setHexRU_RS2] = useState('');
  const [hexRU_DataWrite, setHexRU_DataWrite] = useState('');

  useEffect(() => {
    if (currentResult && currentResult.ru) {
      setHexRU_RS1(binaryToHex(currentResult.ru.rs1).toUpperCase());
      setHexRU_RS2(binaryToHex(currentResult.ru.rs2).toUpperCase());
      setHexRU_DataWrite(binaryToHex(currentResult.ru.dataWrite).toUpperCase());
    }
  }, [currentResult]);

  return (
    <>
      <div className="absolute top-[1.4rem] left-[.8rem]">
        {!(currentType === 'J' || currentType === 'LUI' || currentType === 'AUIPC') && (
          <LabelValue label="" value={`b'${currentInst.encoding.rs1}`} />
        )}
      </div>

      <div className="absolute top-[6.6rem] left-[.8rem]">
        {(currentType === 'R' || currentType === 'S' || currentType === 'B') && (
          <LabelValue label="" value={`b'${currentInst.encoding.rs2}`} />
        )}
      </div>

      <div className="absolute top-[12rem] left-[.8rem]">
        {!(currentType === 'S' || currentType === 'B') && (
          <LabelValue label="" value={`b'${currentInst.encoding.rd}`} />
        )}
      </div>

      <div className="absolute top-[1rem] right-[.8rem]">
        {!(currentType === 'J' || currentType === 'LUI' || currentType === 'AUIPC') && (
          <LabelValue label={`RU[x${currentInst.rs1?.regenc}]`} value={`h'${hexRU_RS1}`} input={false} />
        )}
      </div>

      <div className="absolute top-[9.2rem] right-[.8rem]">
        {(currentType === 'R' || currentType === 'S' || currentType === 'B') && (
          <LabelValue label={`RU[x${currentInst.rs2?.regenc}]`} value={`h'${hexRU_RS2}`} input={false} />
        )}
      </div>

      {!(currentType === 'S' || currentType === 'B') && (
      <div className="absolute top-[16rem] left-[.8rem]">
        <LabelValue label="DataWr" value={`h'${hexRU_DataWrite}`} />
      </div>
      )}

      <div className="absolute bottom-[2.2rem] left-[.8rem]">
        <LabelValue label="" value={`b'${currentResult.ru.writeSignal}`} />
      </div>
    </>
  );
};

export default LabelValueContainer;
