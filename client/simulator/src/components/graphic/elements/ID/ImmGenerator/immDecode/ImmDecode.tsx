import { useCurrentInst } from '@/context/graphic/CurrentInstContext';
import TypeIImmDecode from './TypeIImmDecode';
import TypeSImmDecode from './TypeSImmDecode';
import TypeBImmDecode from './TypeBImmDecode';
import TypeUImmDecode from './TypeUImmDecode';
import TypeJImmDecode from './TypeJImmDecode';

const ImmDecode = () => {
  const { currentType, pipelineValuesStages } = useCurrentInst();

  const type = currentType || pipelineValuesStages?.ID?.instruction?.type;


  return (
    <>
      {(type === "I" || type === "L" || type === "JALR") && <TypeIImmDecode />}
      {type === "S" && <TypeSImmDecode />}
      {type === "B" && <TypeBImmDecode />}
      {(type === "LUI" || type === "AUIPC") && <TypeUImmDecode />}
      {type === "J" && <TypeJImmDecode />}
    </>
  );
};

export default ImmDecode;
