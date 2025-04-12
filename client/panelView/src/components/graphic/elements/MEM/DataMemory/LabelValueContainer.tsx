
import LabelValue from '../../../LabelValue';
import { useCurrentInst } from '@/context/graphic/CurrentInstContext';


const LavelValueContainer = () => {
    const { currentInst } = useCurrentInst();
  
  return (
    <>
        <div className='absolute top-[6rem] left-[.8rem]'>
        {(currentInst.type === 'S' || currentInst.type === 'L' ) &&  <LabelValue label="Address" value="h'000"/> }
        </div>

        <div className='absolute top-[13.5rem] left-[.8rem]'>
        {(currentInst.type === 'S' ) &&  <LabelValue label="DataWr" value={`h'`}/> }
        </div>
                
        <div className=' absolute top-[10.5rem] right-[.8rem]'>
        {(currentInst.type === 'L' ) &&  <LabelValue label="DataRd" value="h'000" input={false}/> }
        </div>
    </>
  )
}

export default LavelValueContainer