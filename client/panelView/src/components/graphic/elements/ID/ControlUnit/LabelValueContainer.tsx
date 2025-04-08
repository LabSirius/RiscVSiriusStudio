import { useIR } from '@/context/graphic/IRContext';
import LabelValue from '@/components/graphic/LabelValue';
import { usePC } from '@/context/shared/PCContext';

const LabelValueContainer = () => {
  const { currentType, ir } = useIR();
  const { newPc } = usePC();

  return (
    <>
      <div className=' absolute top-[1.2rem] left-[.8rem]'>
          <LabelValue label='' value={`b'${ir.instructions[newPc].opcode}`}/>
        </div>

        <div className=' absolute top-[6.4rem] left-[.8rem]'>
          {!(currentType === 'LUI') && <LabelValue label="" value={`b'${ir.instructions[newPc].encoding.funct3}`}/>} 
        </div>

        <div className=' absolute top-[11.9rem] left-[.8rem]'>
         {(currentType === 'R') && <LabelValue label="" value={`b'${ir.instructions[newPc].encoding.funct7}`}/>} 
        </div>
    </>
  )
}

export default LabelValueContainer