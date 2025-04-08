interface LabelValueProps {
    label: string;
    value: string | number;
    input?: boolean;
}


const LabelValue = ({label, value, input=true} : LabelValueProps) => {
  return (
    <div className="flex flex-col relative ">
      <h2 className={`subtitleLabelInElement relative top-[.3rem]  ${input ? 'text-start' : 'text-end' }`}>{label}</h2>
      <h2 className="numberLabelInElement">{value}</h2>
    </div>
  )
}

export default LabelValue
