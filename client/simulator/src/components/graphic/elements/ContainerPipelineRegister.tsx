import ClockTriangle from "../ClockTriangle"

const ContainerPipelineRegister = ({text} : {text : string}) => {
  return (
    <div className="relative w-[4.5rem] h-[4.5rem] bg-amber-200 border-4 border-black">
            <p className='absolute bottom-[-2.7rem] text-[1.4rem] text-orange-400 font-semibold left-[50%] transform -translate-x-[50%]'>{text}</p>
            <ClockTriangle pipeline={true}/>
      
    </div>
  )
}

export default ContainerPipelineRegister
