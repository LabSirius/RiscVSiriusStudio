interface LabelValueProps {
    label: string;
    value: string | number;
    input?: boolean;
}


const LabelValue = ({label, value, input=true} : LabelValueProps) => {
  return (
    <div className={`relative flex flex-col ${input ? 'text-start' : 'text-end' }`}>
      <h2 className='subtitleLabelInElement relative top-[.7rem]  '>{label}</h2>
      <h2 className='numberLabelInElement '>{value}</h2>
    </div>
  )
}

export default LabelValue
