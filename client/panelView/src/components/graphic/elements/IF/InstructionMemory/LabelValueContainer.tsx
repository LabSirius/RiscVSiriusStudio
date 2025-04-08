
import LabelValue from '@/components/graphic/LabelValue';
import { useIR } from '@/context/graphic/IRContext';
import { usePC } from '@/context/shared/PCContext';
import { useFormattedPC } from '@/hooks/graphic/useFormattedPC';

const LabelValueContainer = () => {
  const { newPc } = usePC();
  const formattedPC = useFormattedPC(newPc);
  const { ir } = useIR();

  return (
    <>
      <div className='absolute top-[24%] left-[.8rem]'>
        <LabelValue label="PC" value={formattedPC} />
      </div>

      <div className='absolute top-[8rem] right-[.8rem]'>
        <LabelValue label="Instruction" value={`h'${ir.instructions[newPc].encoding.hexEncoding}`} input={false} />
      </div>
    </>
  );
};

export default LabelValueContainer;
