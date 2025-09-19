import { useCurrentInst } from '@/context/graphic/CurrentInstContext';
import TypeIImmDecode from './TypeIImmDecode';
import TypeSImmDecode from './TypeSImmDecode';
import TypeBImmDecode from './TypeBImmDecode';
import TypeUImmDecode from './TypeUImmDecode';
import TypeJImmDecode from './TypeJImmDecode';
import { useSimulator } from '@/context/shared/SimulatorContext';

const ImmDecode = () => {
  const { typeSimulator} = useSimulator()
  const { currentType, pipelineValuesStages } = useCurrentInst();

  const type = typeSimulator === "pipeline" ? pipelineValuesStages?.ID?.instruction?.type : currentType 


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
