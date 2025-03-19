import { useRoutes } from "@/context/RoutesContext"
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FirstHelp from "@/components/Help/FirstHelp"
import { Link } from "lucide-react"

const HelpSection = () => {
  const { routes } = useRoutes();
  const navigate = useNavigate();


  useEffect(() => {
      if (routes === 'uploadMemory') {
        navigate('/settings');
      }
  }, [routes, navigate]);

  return (
    <div className="section-container w-full mt-1">
        <div className="flex gap-2 items-center cursor-pointer">
            <Link  width={18} height={18} />
            <p className="underline text-primary">RISC-V intructions reference</p>
          </div> 
          {routes !== "uploadMemory" && <FirstHelp /> }
    </div>
  )
}

export default HelpSection
