import TunnelContainer from "./TunnelContainer"
import { useOverlay } from "@/context/OverlayContext";

const WBTunnel = () => {
  const { setOverlayWBActive } = useOverlay();
  return (
    <div className="relative w-full"
    onMouseEnter={() => setOverlayWBActive(true)}
    onMouseLeave={() => setOverlayWBActive(false)}>
     <h2 className="subtitleInTunnel ">
       WB
      </h2>
    <TunnelContainer />
   </div>
  )
}

export default WBTunnel
