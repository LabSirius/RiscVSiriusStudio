import { useIR } from '@/context/graphic/IRContext';
import TypeIImmDecode from './TypeIImmDecode';
import TypeSImmDecode from './TypeSImmDecode';
import TypeBImmDecode from './TypeBImmDecode';
import TypeUImmDecode from './TypeUImmDecode';
import TypeJImmDecode from './TypeJImmDecode';

const ImmDecode = () => {
  const { currentType } = useIR();
  return (
    <>
      {(currentType === "I" || currentType === "L" || currentType === "JALR"  ) && ( <TypeIImmDecode />) }
      {(currentType === "S") && ( <TypeSImmDecode />) }
      {(currentType === "B") && ( <TypeBImmDecode />) }
      {(currentType === "LUI" || currentType === "AUIPC" ) && ( <TypeUImmDecode />) }
      {(currentType === "J") && ( <TypeJImmDecode />) }

    </>
  );
}

export default ImmDecode