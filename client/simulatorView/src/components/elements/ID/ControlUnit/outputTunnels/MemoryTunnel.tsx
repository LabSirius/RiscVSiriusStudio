import TunnelContainer from "./TunnelContainer"
import { useOverlay } from "@/context/OverlayContext";


const MemoryTunnel = () => {
  const { setOverlayMemoryActive } = useOverlay();

  return (
    <div className="relative w-full"
    onMouseEnter={() => setOverlayMemoryActive(true)}
    onMouseLeave={() => setOverlayMemoryActive(false)}>
     <h2 className="subtitleInTunnel ">
       Memory
      </h2>
    <TunnelContainer />
   </div>
  )
}

export default MemoryTunnel
