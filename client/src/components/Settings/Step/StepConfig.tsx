import MemorySizeInput from "../MemorySizeInput";

const StepConfig = () => {
  return (
    <div className="flex flex-col gap-7">
        <div className="flex flex-col gap-3">
        <p className="font-semibold">Memory size (In bytes)</p>
            <MemorySizeInput disabled={true}/>
        </div>
    </div>

  )
}

export default StepConfig