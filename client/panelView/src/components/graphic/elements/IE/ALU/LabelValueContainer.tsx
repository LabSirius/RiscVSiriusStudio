import { useIR } from '@/context/graphic/IRContext';
import LabelValue from '@/components/graphic/LabelValue';



const LabelValueContainer = () => {
  const { currentType } = useIR();
  console.log(currentType)

  return (
    <>
      <div className=' absolute top-[1.4rem] left-[.8rem]'>
          <LabelValue label="A" value="h'00-00-00-00"/>
        </div>

        <div className=' absolute top-[11.4rem] left-[.8rem]'>
          <LabelValue label="B" value="h'00-00-00-00"/>
        </div>

        <div className=' absolute top-[6.8rem] right-[.8rem]'>
          <LabelValue label="ALURes" value="h'00-00-00-00" input={false}/>
        </div>

        
    </>
  )
}

export default LabelValueContainer