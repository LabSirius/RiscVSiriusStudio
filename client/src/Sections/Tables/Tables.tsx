import RegisterTable from "./RegisterTable"
import MemoryTable from "./MamoryTable"

const Tables = () => {
  return (
    <div className="flex gap-5 overflow-x-hidden min-w-min">
        <RegisterTable />
        <MemoryTable />
    
    </div>
  )
}

export default Tables
