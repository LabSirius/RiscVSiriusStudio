import ExportRegisters from './ExportRegisters'
import ExportMemory from './ExportMemory'

const FullExportView = () => {
  return (
    <div className="flex flex-col gap-2 mt-1"  >
              <p>Export data</p>
              <div className="flex items-center gap-3 mt-2 " >
                <ExportRegisters />
                <ExportMemory />
              </div>
    </div>
  )
}

export default FullExportView
