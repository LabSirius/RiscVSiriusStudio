import { useRoutes } from "@/context/RoutesContext"
import ManualConfig from "../components/Settings/ManualConfig"
import SwitchHexadecimal from "@/components/SwitchHexadecimal"
import Tables from "./Tables/Tables"

const SettingsSection = () => {
  const { routes } = useRoutes()
  return (
    <div className="flex px-4 gap-5 overflow-y-hidden overflow-x-scroll ">
      <Tables />
      <div className='section-container mt-1'>
        <div className="flex flex-col gap-7">

        {routes === "uploadMemory" && 
        
          <ManualConfig /> }

          <SwitchHexadecimal />
        </div>
      </div>
    </div>
  )
}

export default SettingsSection
