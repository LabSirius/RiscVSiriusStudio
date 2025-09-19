import { useCurrentInst } from '@/context/graphic/CurrentInstContext';
import { binaryToHex, binaryToInt } from '@/utils/handlerConversions';
import LabelValueWithHover from '../../LabelValueWithHover';
import { useSimulator } from '@/context/shared/SimulatorContext';

const LabelValueContainer = () => {
  const { typeSimulator } = useSimulator();
  const { currentType, currentMonocycletInst, pipelineValuesStages } = useCurrentInst();

  let binOpcode: string;
  let binFunct3: string;
  let binFunct7: string;
  let activeType: string;

  if (typeSimulator === 'pipeline') {
    const idStage = pipelineValuesStages?.ID;
    if (idStage?.instruction?.pc !== -1) {
      binOpcode = idStage.Opcode;
      binFunct3 = idStage.Funct3;
      binFunct7 = idStage.Funct7;
      activeType = idStage.instruction.type!;
    } else {
      binOpcode = 'XXXXXXX';
      binFunct3 = 'XXX';
      binFunct7 = 'XXXXXXX';
      activeType = '';
    }
  } else {
    binOpcode = currentMonocycletInst?.opcode?.padStart(7, '0') || 'XXXXXXX';
    binFunct3 = currentMonocycletInst?.encoding.funct3?.padStart(3, '0') || 'XXX';
    binFunct7 = currentMonocycletInst?.encoding.funct7?.padStart(7, '0') || 'XXXXXXX';
    activeType = currentType;
  }

  if (!binOpcode || binOpcode.includes('X')) {
    return null;
  }
  
   const decOpcode = binaryToInt(binOpcode).toString();
  const hexOpcode = binaryToHex(binOpcode).toUpperCase();

  const decFunct3 = (binFunct3 ? binaryToInt(binFunct3) : 0).toString();
  const hexFunct3 = binFunct3 ? binaryToHex(binFunct3).toUpperCase() : '';

  const decFunct7 = (binFunct7 ? binaryToInt(binFunct7) : 0).toString();
  const hexFunct7 = binFunct7 ? binaryToHex(binFunct7).toUpperCase() : '';

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
      />

      {/* FUNCT3  */}
      {(activeType !== 'LUI' && activeType !== 'AUIPC' && activeType !== 'J') && (
        <LabelValueWithHover
          label="Funct3"
          value={`b'${binFunct3}`}
          decimal={decFunct3}
          binary={binFunct3}
          hex={hexFunct3}
          positionClassName={`${typeSimulator === 'pipeline' ? 'left-[71.5rem] top-[0.1rem]' : 'left-[66.5rem] top-[-.6rem]'} `}
        />
      )}

      {/* FUNCT7  */}
      {activeType === 'R' && (
        <LabelValueWithHover
          label="Funct7"
          value={`b'${binFunct7}`}
          decimal={decFunct7}
          binary={binFunct7}
          hex={hexFunct7}
          positionClassName={` ${typeSimulator === 'pipeline' ? 'left-[81.4rem] top-[0.1rem]' : 'left-[76.4rem] top-[-.6rem]'} `}
        />
      )}
    </>
  );
};

export default LabelValueContainer;