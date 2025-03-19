import { useRoutes } from "@/context/RoutesContext"
import ManualConfig from "../components/Settings/ManualConfig"
import SwitchHexadecimal from "@/components/SwitchHexadecimal"

const SettingsSection = () => {
  const { routes } = useRoutes()
  return (
    <div className='section-container mt-1'>

      <div className="flex flex-col gap-9">

      {routes === "uploadMemory" && <ManualConfig /> }

        <SwitchHexadecimal />

      </div>

    </div>
  )
}

export default SettingsSection
