import { useOperation } from "@/context/OperationContext"
import FirstHelp from "@/components/Help/FirstHelp"
import SettingsHelp from "@/components/Help/SettingsHelp/SettingsHelp"
import { Link } from "lucide-react"

const HelpSection = () => {
  const { operation } = useOperation();

  return (
    <div className="w-full mt-1 section-container">
        <div className="flex items-center cursor-pointer gap-9">
            <Link  width={18} height={18} />
            <p className="underline text-primary">RISC-V intructions reference</p>
          </div> 
          {operation !== "uploadMemory" && <FirstHelp /> }
          {operation === "uploadMemory" && <SettingsHelp />}

    </div>
  )
}

export default HelpSection
