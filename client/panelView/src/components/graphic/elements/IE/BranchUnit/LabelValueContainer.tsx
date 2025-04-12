import { useEffect, useState } from 'react';
import LabelValue from '../../../LabelValue';
import { useCurrentInst } from '@/context/graphic/CurrentInstContext';
import { binaryToHex } from '@/utils/handlerConversions';

const LavelValueContainer = () => {
  const { currentType, currentResult } = useCurrentInst();

  const [hexA, setHexA] = useState('');
  const [hexB, setHexB] = useState('');

  useEffect(() => {
    if (currentResult && currentResult.bu) {
      setHexA(binaryToHex(currentResult.bu.a).toUpperCase());
      setHexB(binaryToHex(currentResult.bu.b).toUpperCase());
    }
  }, [currentResult]);

  return (
  
      <>
        { currentType === 'B' && (
          <>
              <div className="absolute top-[1.2rem] left-[.8rem]">
                <LabelValue label="" value={`h'${hexB}`} />
              </div>

              <div className="absolute top-[5.5rem] left-[.8rem]">
                <LabelValue label="" value={`h'${hexA}`} />
              </div>
         </>
        )}

        <div className="absolute bottom-[-6.43rem] right-[-.8rem]">
          <LabelValue label="" input={false} value={`b'${currentResult.bu.operation}`} />
        </div>

        <div className="absolute top-[3.7rem] right-[.8rem]">
          <LabelValue label="" input={false} value={`b'${currentResult.bu.result}`} />
        </div>
      </>
    )
};

export default LavelValueContainer;
