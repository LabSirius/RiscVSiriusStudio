import FirstHelp from "@/components/FirstHelp"
import { Link } from "lucide-react"

const HelpSection = () => {
  return (
    <div className="section-container w-full mt-1">
        <div className="flex gap-2 items-center cursor-pointer">
            <Link  width={18} height={18} />
            <p className="underline text-primary">RISC-V intructions reference</p>
          </div> 
          <FirstHelp />
    </div>
  )
}

export default HelpSection
