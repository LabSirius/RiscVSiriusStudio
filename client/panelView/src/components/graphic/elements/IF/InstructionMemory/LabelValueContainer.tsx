
import LabelValue from '../../../LabelValue';


const LavelValueContainer = () => {
  return (
    <>
        <div className='absolute top-[36%] left-[.8rem]'>
                  <LabelValue label="PC" value="00-00"/>
                </div>
                
                <div className=' absolute top-[50%] right-[.8rem]'>
                  <LabelValue label="Instruction" value="00-00-00-00" input={false}/>
        </div>
    </>
  )
}

export default LavelValueContainer