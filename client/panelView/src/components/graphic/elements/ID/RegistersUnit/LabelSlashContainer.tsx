import LabelSlash from '@/components/graphic/LabelSlash';
import { useIR } from '@/context/graphic/IRContext';


const LabelSlashContainer = () => {
  const { currentType } = useIR();

  return (
    <div className='absolute top-[.5rem] left-[-6.85rem] flex flex-col gap-[3.4rem]'>
            <div className='flex flex-col gap-[2.3rem]'>
              <LabelSlash label='rs1' number={5}  inactive={(currentType === 'LUI')}/>
              <LabelSlash label='rs2' number={5} inactive={!(currentType === 'R' || currentType === 'B')} />
              <LabelSlash label='rd' number={5} inactive={(currentType === 'B')}/>
            </div>
            <div className='ml-[.8rem]'>
              <LabelSlash number={32} inactive={(currentType === 'S' || currentType === 'B')} />
            </div>
            
          </div>
  )
}

export default LabelSlashContainer
