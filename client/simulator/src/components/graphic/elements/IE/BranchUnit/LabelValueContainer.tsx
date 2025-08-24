import { useEffect, useState } from 'react';
import { useCurrentInst } from '@/context/graphic/CurrentInstContext';
import LabelValueWithHover from '@/components/graphic/elements/LabelValueWithHover';
import { binaryToHex, binaryToInt } from '@/utils/handlerConversions';

const branchOperations: Record<string, string> = {
  "01000": "A == B",
  "01001": "A != B",
  "01100": "A < B",
  "01101": "A >= B",
  "01110": "A < B",
  "01111": "A >= B",
};

const LabelValueContainer = () => {
  const { currentType, currentMonocycleResult } = useCurrentInst();

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

  const [operationDesc, setOperationDesc] = useState<string | undefined>(undefined); // NUEVO

  useEffect(() => {
    if (currentMonocycleResult?.bu) {
      const a = currentMonocycleResult.bu.a;
      const b = currentMonocycleResult.bu.b;
      const op = currentMonocycleResult.bu.operation;
      const res = currentMonocycleResult.bu.result;

      setHexA(binaryToHex(a).toUpperCase());
      setHexB(binaryToHex(b).toUpperCase());
      setDecA(binaryToInt(a));
      setDecB(binaryToInt(b));
      setBinA(a);
      setBinB(b);

      setOpBin(op);

      if (op.includes('X')) {
        setOpHex(op);
        setOpDec(op);
        setOperationDesc(undefined); // para cuando no es un valor válido
      } else {
        setOpHex(binaryToHex(op).toUpperCase());
        setOpDec(binaryToInt(op));
        setOperationDesc(branchOperations[op]); // NUEVO
      }

      setResHex(binaryToHex(res).toUpperCase());
      setResBin(res);
      setResDec(binaryToInt(res));
    }
  }, [currentMonocycleResult]);

  const showZeroExtend = operationDesc === '01110' || operationDesc === '01111';

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

      {/* Operation (brOp) */}
      <LabelValueWithHover
        label=""
        value={`b'${opBin}`}
        decimal={`${opDec}`}
        binary={opBin}
        hex={`${opHex}`}
        positionClassName="absolute bottom-[-6.43rem] right-[-.8rem]"
        input={false}
        operation={operationDesc} 
        showZeroExtend={showZeroExtend} 
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
