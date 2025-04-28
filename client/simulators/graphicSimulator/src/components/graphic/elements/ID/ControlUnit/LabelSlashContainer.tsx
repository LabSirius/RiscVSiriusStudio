import LabelSlash from '@/components/graphic/LabelSlash';
import { useCurrentInst } from '@/context/graphic/CurrentInstContext';


const LabelSlashContainer = () => {
  const { currentType } = useCurrentInst();

  return (
    <div className='absolute top-0 left-[-9.7rem] flex flex-col gap-[2.6rem]'>
          <LabelSlash label='opcode' number={7} />
          <LabelSlash label='funct3' number={3} inactive={currentType === 'LUI' || currentType === 'J' || currentType === 'AUIPC'  } />
          <LabelSlash label='funct7' number={7} inactive={!(currentType === 'R')} />
    </div>
  )
}

export default LabelSlashContainer
