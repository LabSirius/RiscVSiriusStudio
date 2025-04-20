import { useCurrentInst } from '@/context/graphic/CurrentInstContext';
import { binaryToHex, binaryToInt } from '@/utils/handlerConversions';
import { useFormattedPC } from '@/hooks/graphic/useFormattedPC';
import LabelValueWithHover from '../../LabelValueWithHover';

const LabelValueContainer = () => {
  const { currentInst } = useCurrentInst();
  const formattedPC = useFormattedPC(currentInst.currentPc);

  const addressValue = parseInt(String(currentInst.currentPc), 2) * 4;
  const binAddress = addressValue.toString(2).padStart(32, '0');
  const decAddress = addressValue.toString();
  const hexAddress = binaryToHex(binAddress).toUpperCase();

  const rawHexInstruction = currentInst.encoding.hexEncoding.toUpperCase();       
  const binInstruction = currentInst.encoding.binEncoding
  const decInstruction = binaryToInt(binInstruction);

  return (
    <>
      <LabelValueWithHover
        label="Address"
        value={formattedPC}
        decimal={decAddress}
        binary={binAddress}
        hex={hexAddress}
        positionClassName="top-[24%] left-[.8rem]"
      />

      <LabelValueWithHover
        label="Instruction"
        value={`h'${rawHexInstruction}`}
        decimal={decInstruction}
        binary={binInstruction}
        hex={rawHexInstruction}
        positionClassName="top-[8rem] right-[.8rem]"
        input={false}
      />
    </>
  );
};

export default LabelValueContainer;
