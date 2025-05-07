import TunnelContainer from "./TunnelContainer"
import { useOverlay } from "@/context/graphic/OverlayContext";

const WBTunnel = () => {
  const { setOverlayWBActive } = useOverlay();
  return (
    <div className="relative w-full ml-[3rem] rotate-270"
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
