import LabelSlash from '@/components/graphic/LabelSlash';
import { useIR } from '@/context/graphic/IRContext';


const LabelSlashContainer = () => {
  const { currentType } = useIR();

  return (
    <div className='absolute top-0 left-[-9.7rem] flex flex-col gap-[2.6rem]'>
          <LabelSlash label='opcode' number={7} />
          <LabelSlash label='funct3' number={3} inactive={currentType === 'LUI' || currentType === 'AUIPC'  } />
          <LabelSlash label='funct7' number={7} inactive={!(currentType === 'R')} />
    </div>
  )
}

export default LabelSlashContainer
