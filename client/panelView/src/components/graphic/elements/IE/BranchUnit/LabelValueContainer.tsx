
import LabelValue from '../../../LabelValue';
import { useCurrentInst } from '@/context/graphic/CurrentInstContext';


const LavelValueContainer = () => {
    const { currentInst, currentRs1,  currentRs2 } = useCurrentInst();
  
  return (
    (currentInst.type === 'B') &&
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