import { Slash } from 'lucide-react';

interface LabelSlashProps {
    label?: string;
    number: number;
    inactive?: boolean;
}

const LabelSlash = ({label="", number, inactive=false}: LabelSlashProps) => {
  return (
    <div className="relative flex gap-3">
      <h2 className='subtitleLabelInElement'>{label}</h2>
      <div className='relative flex flex-col'>
        <h3 className={`numberNumBitsInput ${inactive && '!text-[#D3D3D3]'} absolute top-[-.7rem] left-[.7rem]`}>{number}</h3>
        <Slash size={20} strokeWidth={3} color={inactive ? '#D3D3D3' : 'orange'} className='absolute top-[1.5rem]'/>

      </div>
    </div>
  )
}

export default LabelSlash
