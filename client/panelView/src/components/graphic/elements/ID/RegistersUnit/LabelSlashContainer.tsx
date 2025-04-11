import LabelSlash from '@/components/graphic/LabelSlash';
import { useCurrentInst } from '@/context/graphic/CurrentInstContext';


const LabelSlashContainer = () => {
  const { currentInst } = useCurrentInst();

  return (
    <div className='absolute top-[.5rem] left-[-6.85rem] flex flex-col gap-[3.4rem]'>
            <div className='flex flex-col gap-[2.3rem]'>
              <LabelSlash label='rs1' number={5}  inactive={(currentInst.type === 'LUI' || currentInst.type === 'J')}/>
              <LabelSlash label='rs2' number={5} inactive={!(currentInst.type === 'R' || currentInst.type === 'B' || currentInst.type === 'S')} />
              <LabelSlash label='rd' number={5} inactive={(currentInst.type === 'B' || currentInst.type === 'S')}/>
            </div>
            <div className='ml-[.8rem]'>
              <LabelSlash number={32} inactive={(currentInst.type === 'S' || currentInst.type === 'B')} />
            </div>
            
          </div>
  )
}

export default LabelSlashContainer
