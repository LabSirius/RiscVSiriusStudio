import { useIR } from '@/context/graphic/IRContext';
import LabelValue from '@/components/graphic/LabelValue';



const LabelValueContainer = () => {
  const { currentType } = useIR();
  console.log(currentType)

  return (
    <>
      <div className=' absolute top-[1.2rem] left-[.8rem]'>
          <LabelValue label="" value="0000000"/>
        </div>

        <div className=' absolute top-[6.4rem] left-[.8rem]'>
          <LabelValue label="" value="000"/>
        </div>

        <div className=' absolute top-[11.9rem] left-[.8rem]'>
          <LabelValue label="" value="00000"/>
        </div>
    </>
  )
}

export default LabelValueContainer