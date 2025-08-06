import RegisterTable from "./RegisterTable"
import MemoryTable from "./MemoryTable"
import StagesPipeline from "./StagesPipeline"

const Tables = () => {
  return (
    <div className="flex gap-5 overflow-hidden min-w-min">
        <RegisterTable />
        <MemoryTable />
        <StagesPipeline />
    
    </div>
  )
}

export default Tables
