import { useCurrentInst } from '@/context/graphic/CurrentInstContext';
import { binaryToHex, binaryToInt } from '@/utils/handlerConversions';
import LabelValueWithHover from '../../LabelValueWithHover';
import { useSimulator } from '@/context/shared/SimulatorContext';

const LabelValueContainer = () => {
  const { typeSimulator} = useSimulator()
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
        positionClassName={` ${typeSimulator === 'pipeline' ? 'left-[60rem] top-[0.1rem]' : 'left-[55rem] top-[-.6rem]'} `}
        // positionClassName="top-[-.6rem] left-[52rem]"
      />

      {/* FUNCT3  */}
      {(currentType !== 'LUI' && currentType !== 'AUIPC' && currentType !== 'J') && (
        <LabelValueWithHover
          label="Funct3"
          value={`b'${binFunct3}`}
          decimal={decFunct3}
          binary={binFunct3}
          hex={hexFunct3}
          positionClassName={`${typeSimulator === 'pipeline' ? 'left-[71.5rem] top-[0.1rem]' : 'left-[66.5rem] top-[-.6rem]'} `}
          // positionClassName="top-[-.6rem] left-[63.5rem]"
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
          positionClassName={` ${typeSimulator === 'pipeline' ? 'left-[81.4rem] top-[0.1rem]' : 'left-[76.4rem] top-[-.6rem]'} `}
          // // positionClassName=" top-[-.6rem] left-[73.4rem]"
        />
      )}
    </>
  );
};

export default LabelValueContainer;
