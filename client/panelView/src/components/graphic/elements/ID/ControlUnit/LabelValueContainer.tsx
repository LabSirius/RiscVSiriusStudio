import { useIR } from '@/context/graphic/IRContext';
import LabelValue from '@/components/graphic/LabelValue';
import { usePC } from '@/context/shared/PCCONTEXT';

const LabelValueContainer = () => {
  const { currentType, ir } = useIR();
  const { newPc } = usePC();
  console.log(currentType, )

  return (
    <>
      <div className=' absolute top-[1.2rem] left-[.8rem]'>
          <LabelValue label='' value={`b'${ir.instructions[newPc].opcode}`}/>
        </div>

        <div className=' absolute top-[6.4rem] left-[.8rem]'>
          <LabelValue label="" value="b'000"/>
        </div>

        <div className=' absolute top-[11.9rem] left-[.8rem]'>
          <LabelValue label="" value="b'00000"/>
        </div>
    </>
  )
}

export default LabelValueContainer