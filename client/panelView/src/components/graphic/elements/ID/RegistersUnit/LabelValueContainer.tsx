import { useIR } from '@/context/graphic/IRContext';
import LabelValue from '@/components/graphic/LabelValue';
import { usePC } from '@/context/shared/PCContext';


const LabelValueContainer = () => {
  const { currentType, ir } = useIR();
   const { newPc } = usePC();

  console.log(currentType)

  return (
    <>
      <div className=' absolute top-[1.4rem] left-[.8rem]'>
          <LabelValue label="" value={`b'${ir.instructions[newPc].encoding.rs1}'`}/>
        </div>

        <div className=' absolute top-[6.6rem] left-[.8rem]'>
         {(currentType === 'R' || currentType === 'S'  || currentType === 'B' ) && <LabelValue label="" value={`b'${ir.instructions[newPc].encoding.rs2}'`}/>}
        </div>

        <div className=' absolute top-[12rem] left-[.8rem]'>
        {!(currentType === 'S'  || currentType === 'B' ) && <LabelValue label="" value={`b'${ir.instructions[newPc].encoding.rd}'`}/>}
        </div>

        <div className=' absolute top-[16rem] left-[.8rem]'>
          <LabelValue label="DataWr" value="h'00-00-00-00"/>
        </div>

        <div className=' absolute top-[1rem] right-[.8rem]'>
          <LabelValue label="RU[rs1]" value="h'00-00-00-00" input={false}/>
        </div>

        <div className=' absolute top-[9.2rem] right-[.8rem]'>
        {(currentType === 'R' || currentType === 'S'  || currentType === 'B' ) && <LabelValue label="RU[rs2]" value="h'00-00-00-00" input={false}/> }
        </div>
    </>
  )
}

export default LabelValueContainer