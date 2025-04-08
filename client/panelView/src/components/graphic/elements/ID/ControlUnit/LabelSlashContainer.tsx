import LabelSlash from '@/components/graphic/LabelSlash';
import { useIR } from '@/context/graphic/IRContext';


const LabelSlashContainer = () => {
  const { currentType } = useIR();

  return (
    <div className='absolute top-[.5rem] left-[-9.2rem] flex flex-col gap-[3rem]'>
          <LabelSlash label='opcode' number={7} />
          <LabelSlash label='funct3' number={3} inactive={currentType === 'LUI'} />
          <LabelSlash label='funct7' number={7} inactive={!(currentType === 'R')} />
    </div>
  )
}

export default LabelSlashContainer
