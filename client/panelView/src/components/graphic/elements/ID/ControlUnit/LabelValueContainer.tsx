import { useIR } from '@/context/graphic/IRContext';


const LabelValueContainer = () => {
  const { currentType } = useIR();
  console.log(currentType)

  return (
    <div className='absolute top-[.5rem] left-0 flex flex-col gap-[3rem]'>
          
    </div>
  )
}

export default LabelValueContainer