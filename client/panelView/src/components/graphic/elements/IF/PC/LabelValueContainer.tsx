import { useEffect, useState } from 'react';
import LabelValue from '@/components/graphic/LabelValue';
import { useCurrentInst } from '@/context/graphic/CurrentInstContext';
import { binaryToHex } from '@/utils/handlerConversions';
import { useFormattedPC } from '@/hooks/graphic/useFormattedPC';

const LabelValueContainer = () => {
  const { currentResult, currentInst } = useCurrentInst();
  const formattedPC = useFormattedPC(currentInst.currentPc);

  const [hexNextPC, setHexNextPC] = useState('');

  useEffect(() => {
    if (currentResult && currentResult.buMux) {
      setHexNextPC(binaryToHex(currentResult.buMux.result).toUpperCase());
    }
  }, [currentResult]);

  return (
    <>
      <div className="absolute top-[8rem] left-[.8rem]">
        <LabelValue label="NextPc" value={`h'${hexNextPC}`} />
      </div>

      <div className="absolute top-[3.2rem] right-[.8rem]">
        <LabelValue label="PC" value={formattedPC} input={false} />
      </div>
    </>
  );
};

export default LabelValueContainer;
