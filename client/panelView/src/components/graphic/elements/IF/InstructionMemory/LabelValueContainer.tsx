
import LabelValue from '@/components/graphic/LabelValue';
import { useCurrentInst } from '@/context/graphic/CurrentInstContext';
import { useFormattedPC } from '@/hooks/graphic/useFormattedPC';

const LabelValueContainer = () => {
  const { currentInst } = useCurrentInst();
    const formattedPC = useFormattedPC(currentInst.currentPc);

  return (
    <>
      <div className='absolute top-[24%] left-[.8rem]'>
        <LabelValue label="Address" value={formattedPC} />
      </div>

      <div className='absolute top-[8rem] right-[.8rem]'>
        <LabelValue label="Instruction" value={`h'${currentInst.encoding.hexEncoding}`} input={false} />
      </div>
    </>
  );
};

export default LabelValueContainer;
