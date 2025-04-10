import { useIR } from '@/context/graphic/IRContext';
import TypeIImmDecode from './TypeIImmDecode';

const ImmDecode = () => {
  const { currentType } = useIR();
  return (
    (currentType === "I" || currentType === "L" || currentType === "JALR"  ) && ( <TypeIImmDecode />)
  );
}

export default ImmDecode