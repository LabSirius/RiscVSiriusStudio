
import LabelValue from '../../../LabelValue';
import { useCurrentInst } from '@/context/graphic/CurrentInstContext';


const LavelValueContainer = () => {
    const { currentInst  } = useCurrentInst();
  
  return (
    (currentInst.type === 'B') &&
    <> 
     <div className='absolute top-[1.2rem] left-[.8rem]'>
        <LabelValue label="" value={`h'`}/> 
      </div>
    
      <div className='absolute top-[5.5rem] left-[.8rem]'>
        <LabelValue label="" value={`h'`}/> 
      </div>

    </>
  )
}

export default LavelValueContainer