import { useOperation } from "@/context/OperationContext"
import FirstHelp from "@/components/Help/FirstHelp"
import SettingsHelp from "@/components/Help/SettingsHelp/SettingsHelp"
import LastHelp from "@/components/Help/LastHelp"
import { Link } from "lucide-react"
import { sendMessage } from "@/components/Message/sendMessage"

const HelpSection = () => {
  const { operation } = useOperation();

  const handleLinkClick = () => {
    sendMessage({event:"clickOpenRISCVCard" });
  }
    
  return (
    <div className="w-full mt-1 section-container">
        <div className="flex items-center gap-4 cursor-pointer" onClick={handleLinkClick}>
            <Link  width={18} height={18} />
            <p className="underline text-primary">RISC-V intructions reference</p>
          </div> 
          {(operation !== "uploadMemory" && operation !== "step"  )&& <FirstHelp /> }
          {operation === "uploadMemory" && <SettingsHelp />}
          {operation === "step" && <LastHelp />}

    </div>
  )
}

export default HelpSection
