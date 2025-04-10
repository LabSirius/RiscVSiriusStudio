import { useIR } from '@/context/graphic/IRContext';
import TypeIImmDecode from './TypeIImmDecode';
import TypeSImmDecode from './TypeSImmDecode';
import TypeBImmDecode from './TypeBImmDecode';

const ImmDecode = () => {
  const { currentType } = useIR();
  return (
    <>
      {!(currentType === "I" || currentType === "L" || currentType === "JALR"  ) && ( <TypeIImmDecode />) }
      {(currentType === "S") && ( <TypeSImmDecode />) }
      {(currentType === "B") && ( <TypeBImmDecode />) }


    </>
  );
}

export default ImmDecode