import { Slash } from 'lucide-react';

interface LabelSlashProps {
    label: string;
    number: number;
}

const LabelSlash = ({label, number}: LabelSlashProps) => {
  return (
    <div className="flex gap-3 relative">
      <h2 className='subtitleInElement'>{label}</h2>
      <div className='flex flex-col relative'>
        <h3 className='numberLabelInElement absolute top-[-.4rem] left-[.7rem]'>{number}</h3>
        <Slash size={20} strokeWidth={3} color='orange' className='absolute top-[.9rem]'/>

      </div>
    </div>
  )
}

export default LabelSlash
