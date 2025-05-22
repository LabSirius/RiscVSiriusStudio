import { useCurrentInst } from '@/context/graphic/CurrentInstContext';
import { binaryToHex, binaryToInt } from '@/utils/handlerConversions';
import LabelValueWithHover from '../../LabelValueWithHover';

const LabelValueContainer = () => {
  const { currentType, currentInst } = useCurrentInst();

  // OPCODE
  const binOpcode = currentInst.opcode.padStart(7, '0');
  const decOpcode = binaryToInt(binOpcode);
  const hexOpcode = binaryToHex(binOpcode).toUpperCase();

  // FUNCT3
  const binFunct3 = currentInst.encoding.funct3?.padStart(3, '0') || '';
  const decFunct3 = binaryToInt(binFunct3);
  const hexFunct3 = binaryToHex(binFunct3).toUpperCase();

  // FUNCT7
  const binFunct7 = currentInst.encoding.funct7?.padStart(7, '0') || '';
  const decFunct7 = binaryToInt(binFunct7);
  const hexFunct7 = binaryToHex(binFunct7).toUpperCase();

  return (
    <>
      {/* OPCODE */}
      <LabelValueWithHover
        label="Opcode"
        value={`b'${binOpcode}`}
        decimal={decOpcode}
        binary={binOpcode}
        hex={hexOpcode}
        positionClassName="top-[-.6rem] left-[55rem]"
      />

      {/* FUNCT3  */}
      {(currentType !== 'LUI' && currentType !== 'AUIPC' && currentType !== 'J') && (
        <LabelValueWithHover
          label="Funct3"
          value={`b'${binFunct3}`}
          decimal={decFunct3}
          binary={binFunct3}
          hex={hexFunct3}
          positionClassName="top-[-.6rem] left-[66.5rem]"
        />
      )}

      {/* FUNCT7  */}
      {currentType === 'R' && (
        <LabelValueWithHover
          label="Funct7"
          value={`b'${binFunct7}`}
          decimal={decFunct7}
          binary={binFunct7}
          hex={hexFunct7}
          positionClassName=" top-[-.6rem] left-[76.4rem]"
        />
      )}
    </>
  );
};

export default LabelValueContainer;
