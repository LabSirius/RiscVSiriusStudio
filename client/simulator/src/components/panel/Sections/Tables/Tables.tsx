import RegisterTable from "./RegisterTable"
import MemoryTable from "./MemoryTable"

const Tables = () => {
  return (
    <div className="flex gap-5 overflow-hidden min-w-min">
        <RegisterTable />
        <MemoryTable />
    
    </div>
  )
}

export default Tables
