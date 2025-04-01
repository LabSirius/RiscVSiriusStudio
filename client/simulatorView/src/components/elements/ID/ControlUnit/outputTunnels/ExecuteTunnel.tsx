import TunnelContainer from "./TunnelContainer"
import { useOverlay } from "@/context/OverlayContext";


const ExecuteTunnel = () => {
  const { setOverlayExecuteActive } = useOverlay();

  return (
    <div className="relative w-full"
    onMouseEnter={() => setOverlayExecuteActive(true)}
    onMouseLeave={() => setOverlayExecuteActive(false)}
    >
     <h2 className="subtitleInTunnel ">
       Execute
      </h2>
      <TunnelContainer color="#E3F2FD"/>
   </div>
  )
}

export default ExecuteTunnel
