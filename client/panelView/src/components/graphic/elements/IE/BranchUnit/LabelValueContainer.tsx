
import LabelValue from '../../../LabelValue';
import { useIR } from '@/context/graphic/IRContext';


const LavelValueContainer = () => {
    const { currentType, currentRs1,  currentRs2 } = useIR();
  
  return (
    (currentType === 'B') &&
    <> 
     <div className='absolute top-[1.2rem] left-[.8rem]'>
        <LabelValue label="" value={`h'${currentRs2}`}/> 
      </div>
    
      <div className='absolute top-[5.5rem] left-[.8rem]'>
        <LabelValue label="" value={`h'${currentRs1}`}/> 
      </div>

    </>
  )
}

export default LavelValueContainer