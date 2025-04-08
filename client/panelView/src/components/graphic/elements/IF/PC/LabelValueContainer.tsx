import LabelValue from '@/components/graphic/LabelValue';
import { usePC } from '@/context/shared/PCCONTEXT';
import { unsignedToHex } from '@/utils/handlerConversions';
import { useEffect, useState } from 'react';

const LabelValueContainer = () => {
  const { newPc } = usePC();

  const [formattedPC, setFormattedPC] = useState("h'000");

  useEffect(() => {
    const pcHex = newPc * 4;
    const hex = unsignedToHex(pcHex).padStart(3, '0');
    const formattedHex = `h'${hex}`;
    setFormattedPC(formattedHex);
  }, [newPc]);

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
