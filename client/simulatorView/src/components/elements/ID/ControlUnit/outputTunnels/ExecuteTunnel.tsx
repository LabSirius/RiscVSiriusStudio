import TunnelContainer from "./TunnelContainer"
import { useOverlay } from "@/context/OverlayContext";


const ExecuteTunnel = () => {
  const { setOverlayExecuteActive } = useOverlay();

  return (
    <div className="w-full relative"
    onMouseEnter={() => setOverlayExecuteActive(true)}
    onMouseLeave={() => setOverlayExecuteActive(false)}
    >
     <h2 className="subtitleInTunnel ">
       Execute
      </h2>
    <TunnelContainer />
   </div>
  )
}

export default ExecuteTunnel
