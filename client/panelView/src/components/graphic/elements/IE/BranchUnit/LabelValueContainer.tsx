import { useEffect, useState } from 'react';
import { useCurrentInst } from '@/context/graphic/CurrentInstContext';
import LabelValueWithHover from '@/components/graphic/elements/LabelValueWithHover';
import { binaryToHex, binaryToInt } from '@/utils/handlerConversions';

const LabelValueContainer = () => {
  const { currentType, currentResult } = useCurrentInst();

  const [hexA, setHexA] = useState('');
  const [hexB, setHexB] = useState('');
  const [decA, setDecA] = useState('');
  const [decB, setDecB] = useState('');
  const [binA, setBinA] = useState('');
  const [binB, setBinB] = useState('');

  const [opHex, setOpHex] = useState('');
  const [opBin, setOpBin] = useState('');
  const [opDec, setOpDec] = useState('');

  const [resHex, setResHex] = useState('');
  const [resBin, setResBin] = useState('');
  const [resDec, setResDec] = useState('');

  useEffect(() => {
    if (currentResult?.bu) {
      const a = currentResult.bu.a;
      const b = currentResult.bu.b;
      const op = currentResult.bu.operation;
      const res = currentResult.bu.result;

      setHexA(binaryToHex(a).toUpperCase());
      setHexB(binaryToHex(b).toUpperCase());
      setDecA(binaryToInt(a));
      setDecB(binaryToInt(b));
      setBinA(a);
      setBinB(b);

      setOpHex(binaryToHex(op).toUpperCase());
      setOpBin(op);
      setOpDec(binaryToInt(op));

      setResHex(binaryToHex(res).toUpperCase());
      setResBin(res);
      setResDec(binaryToInt(res));
    }
  }, [currentResult]);

  return (
    <>
      {currentType === 'B' && (
        <>
          {/* B */}
          <LabelValueWithHover
            label=""
            value={`h'${hexB}`}
            decimal={decB}
            binary={binB}
            hex={hexB}
            positionClassName="absolute top-[1.2rem] left-[.8rem]"
          />

          {/* A */}
          <LabelValueWithHover
            label=""
            value={`h'${hexA}`}
            decimal={decA}
            binary={binA}
            hex={hexA}
            positionClassName="absolute top-[5.5rem] left-[.8rem]"
          />
        </>
      )}

      {/* Operation */}
      <LabelValueWithHover
        label=""
        value={`b'${opBin}`}
        decimal={opDec}
        binary={opBin}
        hex={opHex}
        positionClassName="absolute bottom-[-6.43rem] right-[-.8rem]"
        input={false}
      />

      {/* Result */}
      <LabelValueWithHover
        label=""
        value={`b'${resBin}`}
        decimal={resDec}
        binary={resBin}
        hex={resHex}
        positionClassName="absolute top-[3.7rem] right-[.8rem]"
        input={false}
      />
    </>
  );
};

export default LabelValueContainer;
