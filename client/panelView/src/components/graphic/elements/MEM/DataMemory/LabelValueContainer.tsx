import { useEffect, useState } from 'react';
import LabelValue from '../../../LabelValue';
import { useCurrentInst } from '@/context/graphic/CurrentInstContext';
import { binaryToHex } from '@/utils/handlerConversions';

const LavelValueContainer = () => {
  const { currentType, currentResult } = useCurrentInst();

  const [hexAddress, setHexAddress] = useState('');
  const [hexDataWr, setHexDataWr] = useState('');
  const [hexDataRd, setHexDataRd] = useState('');

  useEffect(() => {
    if (currentResult && currentResult.dm) {
      setHexAddress(binaryToHex(currentResult.dm.address).toLocaleUpperCase());
      setHexDataWr(binaryToHex(currentResult.dm.dataWr).toLocaleUpperCase());
      setHexDataRd(binaryToHex(currentResult.dm.dataRd).toUpperCase());
    }
  }, [currentResult]);

  return (
    <>
      <div className="absolute top-[6rem] left-[.8rem]">
        {(currentType === 'S' || currentType === 'L') && (
          <LabelValue label="Address" value={`h'${hexAddress}`} />
        )}
      </div>

      <div className="absolute top-[13.5rem] left-[.8rem]">
        {currentType === 'S' && (
          <LabelValue label="DataWr" value={`h'${hexDataWr}`} />
        )}
      </div>

      <div className="absolute top-[10.5rem] right-[.8rem]">
        {currentType === 'L' && (
          <LabelValue label="DataRd" value={`h'${hexDataRd}`} input={false} />
        )}
      </div>

      <div className="absolute top-[-8.55rem] left-[4.2rem]">
          <LabelValue label="" value={`b'${currentResult.dm.writeSignal}`} input={false} />
      </div>

      <div className="absolute top-[-8.55rem] right-[3.6rem]">
          <LabelValue label="" value={`b'${currentResult.dm.controlSignal}`} input={false} />
      </div>
    </>
  );
};

export default LavelValueContainer;
