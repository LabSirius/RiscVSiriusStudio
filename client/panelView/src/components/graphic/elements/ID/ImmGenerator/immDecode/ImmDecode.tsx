import { useIR } from '@/context/graphic/IRContext';
import TypeIImmDecode from './TypeIImmDecode';
import TypeSImmDecode from './TypeSImmDecode';

const ImmDecode = () => {
  const { currentType } = useIR();
  return (
    <>
      {(currentType === "I" || currentType === "L" || currentType === "JALR"  ) && ( <TypeIImmDecode />) }
      {(currentType === "S") && ( <TypeSImmDecode />) }
    </>
  );
}

export default ImmDecode