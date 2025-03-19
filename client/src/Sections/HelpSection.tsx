import { useRoutes } from "@/context/RoutesContext"
import FirstHelp from "@/components/Help/FirstHelp"
import SettingsHelp from "@/components/Help/SettingsHelp/SettingsHelp"
import { Link } from "lucide-react"

const HelpSection = () => {
  const { routes } = useRoutes();

  return (
    <div className="section-container w-full mt-1">
        <div className="flex gap-8 items-center cursor-pointer">
            <Link  width={18} height={18} />
            <p className="underline text-primary">RISC-V intructions reference</p>
          </div> 
          {routes !== "uploadMemory" && <FirstHelp /> }
          {routes === "uploadMemory" && <SettingsHelp />}

    </div>
  )
}

export default HelpSection
