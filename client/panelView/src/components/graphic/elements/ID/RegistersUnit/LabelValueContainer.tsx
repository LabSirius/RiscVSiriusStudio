import { useIR } from '@/context/graphic/IRContext';
import LabelValue from '@/components/graphic/LabelValue';


const LabelValueContainer = () => {
  const { currentType } = useIR();
  console.log(currentType)

  return (
    <>
      <div className=' absolute top-[1.4rem] left-[.8rem]'>
          <LabelValue label="" value="b'00000"/>
        </div>

        <div className=' absolute top-[6.6rem] left-[.8rem]'>
          <LabelValue label="" value="b'00000"/>
        </div>

        <div className=' absolute top-[12rem] left-[.8rem]'>
          <LabelValue label="" value="b'00000"/>
        </div>

        <div className=' absolute top-[16rem] left-[.8rem]'>
          <LabelValue label="DataWr" value="h'00-00-00"/>
        </div>
    </>
  )
}

export default LabelValueContainer