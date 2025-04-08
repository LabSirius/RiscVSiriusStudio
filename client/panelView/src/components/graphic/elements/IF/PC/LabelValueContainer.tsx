import { useIR } from '@/context/graphic/IRContext';
import LabelValue from '@/components/graphic/LabelValue';


const LabelValueContainer = () => {
  const { currentType } = useIR();
  console.log(currentType)

  return (
    <>
      <div className=' absolute top-[8rem] left-[.8rem]'>
          <LabelValue label="NextPc" value="h'00-00"/>
        </div>

        <div className=' absolute top-[3.2rem] right-[.8rem]'>
          <LabelValue label="PC" value="h'00-00" input={false}/>
        </div>
    </>
  )
}

export default LabelValueContainer