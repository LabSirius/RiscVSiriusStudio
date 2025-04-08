import LabelValue from '@/components/graphic/LabelValue';
import { usePC } from '@/context/shared/PCCONTEXT';
import { useFormattedPC } from '@/hooks/useFormattedPC'; 

const LabelValueContainer = () => {
  const { newPc } = usePC();
  const formattedPC = useFormattedPC(newPc);

  return (
    <>
      <div className='absolute top-[24%] left-[.8rem]'>
        <LabelValue label="PC" value={formattedPC} />
      </div>

      <div className='absolute top-[8rem] right-[.8rem]'>
        <LabelValue label="Instruction" value="h'00-00-00-00" input={false} />
      </div>
    </>
  );
};

export default LabelValueContainer;
