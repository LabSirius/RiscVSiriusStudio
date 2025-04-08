interface LabelValueProps {
    label: string;
    value: string | number;
    input?: boolean;
}


const LabelValue = ({label, value, input=true} : LabelValueProps) => {
  return (
    <div className="relative flex flex-col ">
      <h2 className={`subtitleLabelInElement relative top-[.7rem]  ${input ? 'text-start' : 'text-end' }`}>{label}</h2>
      <h2 className="numberLabelInElement">{value}</h2>
    </div>
  )
}

export default LabelValue
