
import LabelValue from '../../../LabelValue';


const LavelValueContainer = () => {
  return (
    <>
        <div className='absolute top-[6rem] left-[.8rem]'>
            <LabelValue label="Address" value="h'00-00-00-00"/>
        </div>

        <div className='absolute top-[13.5rem] left-[.8rem]'>
            <LabelValue label="DataWr" value="h'00-00-00-00"/>
        </div>
                
        <div className=' absolute top-[10.5rem] right-[.8rem]'>
            <LabelValue label="DataRd" value="h'00-00-00-00" input={false}/>
        </div>
    </>
  )
}

export default LavelValueContainer