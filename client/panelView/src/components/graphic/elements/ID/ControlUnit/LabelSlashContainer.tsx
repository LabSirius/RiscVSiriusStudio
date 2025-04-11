import LabelSlash from '@/components/graphic/LabelSlash';
import { useCurrentInst } from '@/context/graphic/CurrentInstContext';


const LabelSlashContainer = () => {
  const { currentInst } = useCurrentInst();

  return (
    <div className='absolute top-0 left-[-9.7rem] flex flex-col gap-[2.6rem]'>
          <LabelSlash label='opcode' number={7} />
          <LabelSlash label='funct3' number={3} inactive={currentInst.type === 'LUI' || currentInst.type === 'AUIPC'  } />
          <LabelSlash label='funct7' number={7} inactive={!(currentInst.type === 'R')} />
    </div>
  )
}

export default LabelSlashContainer
