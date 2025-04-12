import { useCurrentInst } from '@/context/graphic/CurrentInstContext';
import LabelValue from '@/components/graphic/LabelValue';

const LabelValueContainer = () => {
  const { currentType, currentInst } = useCurrentInst();

  return (
    <>
      <div className=' absolute top-[1.2rem] left-[.8rem]'>
          <LabelValue label='' value={`b'${currentInst.opcode}`}/>
        </div>

        <div className=' absolute top-[6.4rem] left-[.8rem]'>
          {!(currentType === 'LUI' || currentType === 'AUIPC' || currentType === 'J' ) && <LabelValue label="" value={`b'${currentInst.encoding.funct3}`}/>} 
        </div>

        <div className=' absolute top-[11.9rem] left-[.8rem]'>
         {(currentType === 'R') && <LabelValue label="" value={`b'${currentInst.encoding.funct7}`}/>} 
        </div>
    </>
  )
}

export default LabelValueContainer