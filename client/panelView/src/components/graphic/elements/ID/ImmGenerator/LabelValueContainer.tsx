import { useEffect, useState } from 'react';
import { useCurrentInst } from '@/context/graphic/CurrentInstContext';
import LabelValue from '@/components/graphic/LabelValue';
import { binaryToHex } from '@/utils/handlerConversions';

const LabelValueContainer = () => {
  const { currentType, currentResult } = useCurrentInst();
  
  const [hexImm, setHexImm] = useState('');

  useEffect(() => {
    if (currentResult && currentResult.imm) {
      setHexImm(binaryToHex(currentResult.imm.output).toUpperCase());
    }
  }, [currentResult]);

  return (
    <>
      <div className="absolute top-[1.5rem] right-[.8rem]">
        {!(currentType === 'R') && (
          <LabelValue label="Imm" value={`h'${hexImm}`} input={false} />
        )}
      </div>

      <div className="absolute bottom-[1.2rem] left-[.8rem]">
        {(
          <LabelValue label="" value={`b'${currentResult.imm.signal}`} input={false} />
        )}
      </div>
    </>
  );
};

export default LabelValueContainer;
