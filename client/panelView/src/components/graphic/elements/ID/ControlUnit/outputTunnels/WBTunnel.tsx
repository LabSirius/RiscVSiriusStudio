import TunnelContainer from "./TunnelContainer"
import { useOverlay } from "@/context/graphic/OverlayContext";

const WBTunnel = () => {
  const { setOverlayWBActive } = useOverlay();
  return (
    <div className="relative w-full"
    onMouseEnter={() => setOverlayWBActive(true)}
    onMouseLeave={() => setOverlayWBActive(false)}>
     <h2 className="subtitleInTunnel ">
       WB
      </h2>
    <TunnelContainer color="#FFF2E0" />
   </div>
  )
}

export default WBTunnel
