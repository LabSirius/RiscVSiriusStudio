import { useSimulator } from "@/context/shared/SimulatorContext"
import FirstHelp from "@/components/panel/Help/FirstHelp"
import SettingsHelp from "@/components/panel/Help/SettingsHelp/SettingsHelp"
import LastHelp from "@/components/panel/Help/LastHelp"
import { Footprints, Link } from "lucide-react"
import { sendMessage } from "@/components/Message/sendMessage"

const HelpSection = () => {
  const { operation, setShowTuto } = useSimulator();

  const handleLinkClick = () => {
    sendMessage({event:"clickOpenRISCVCard" });
  }
    
  return (
    <div className="w-full mt-1 section-container">
        <div className="flex items-center gap-4 cursor-pointer" onClick={handleLinkClick}>
            <Link  width={18} height={18} />
            <p className="underline text-primary">RISC-V intructions reference</p>
          </div> 
          {operation !== "" && (
             <div className="flex items-center gap-4 cursor-pointer" onClick={() => setShowTuto(true)}>
            <Footprints  width={18} height={18} />
            <p className="underline text-primary">Show tutorial</p>
          </div> 
          ) }
         
          {(operation !== "uploadMemory" && operation !== "step"  )&& <FirstHelp /> }
          {operation === "uploadMemory" && <SettingsHelp />}
          {operation === "step" && <LastHelp />}

    </div>
  )
}

export default HelpSection
