
import LabelValue from '@/components/graphic/LabelValue';
import { useCurrentInst } from '@/context/graphic/CurrentInstContext';

const LabelValueContainer = () => {
  const { currentInst } = useCurrentInst();

  return (
    <>
      <div className='absolute top-[24%] left-[.8rem]'>
        <LabelValue label="PC" value="000" />
      </div>

      <div className='absolute top-[8rem] right-[.8rem]'>
        <LabelValue label="Instruction" value={`h'${currentInst.encoding.hexEncoding}`} input={false} />
      </div>
    </>
  );
};

export default LabelValueContainer;
