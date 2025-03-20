import RegisterTable from "./RegisterTable"
import MemoryTable from "./MamoryTable"

const Tables = () => {
  return (
    <div className="flex gap-5 overflow-hidden ">
        <RegisterTable />
        <MemoryTable />
    
    </div>
  )
}

export default Tables
