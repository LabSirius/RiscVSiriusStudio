
import LabelValue from '../../../LabelValue';
import { useIR } from '@/context/graphic/IRContext';


const LavelValueContainer = () => {
    const { currentType,  currentRs2 } = useIR();
  
  return (
    <>
        <div className='absolute top-[6rem] left-[.8rem]'>
        {(currentType === 'S' || currentType === 'L' ) &&  <LabelValue label="Address" value="h'000"/> }
        </div>

        <div className='absolute top-[13.5rem] left-[.8rem]'>
        {(currentType === 'S' ) &&  <LabelValue label="DataWr" value={`h'${currentRs2}`}/> }
        </div>
                
        <div className=' absolute top-[10.5rem] right-[.8rem]'>
        {(currentType === 'S' || currentType === 'L' ) &&  <LabelValue label="DataRd" value="h'000" input={false}/> }
        </div>
    </>
  )
}

export default LavelValueContainer