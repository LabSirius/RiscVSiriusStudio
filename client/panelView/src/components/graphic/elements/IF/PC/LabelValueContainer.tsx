import LabelValue from '@/components/graphic/LabelValue';
import { usePC } from '@/context/shared/PCContext';
import { useFormattedPC } from '@/hooks/graphic/useFormattedPC'; 

const LabelValueContainer = () => {
  const { newPc } = usePC();
  const formattedPC = useFormattedPC(newPc);

  return (
    <>
      <div className='absolute top-[8rem] left-[.8rem]'>
        <LabelValue label="NextPc" value="h'000'" />
      </div>

      <div className='absolute top-[3.2rem] right-[.8rem]'>
        <LabelValue label="PC" value={formattedPC} input={false} />
      </div>
    </>
  );
};

export default LabelValueContainer;