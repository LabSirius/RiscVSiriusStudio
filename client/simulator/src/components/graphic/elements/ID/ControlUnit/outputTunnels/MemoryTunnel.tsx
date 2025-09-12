import TunnelContainer from "./TunnelContainer"
import { useOverlay } from "@/context/graphic/OverlayContext";


const MemoryTunnel = () => {
  const { setOverlayMemoryActive } = useOverlay();


  return (
    <div className="relative w-full ml-[17rem] rotate-270"
    onMouseEnter={() => setOverlayMemoryActive(true)}
    onMouseLeave={() => setOverlayMemoryActive(false)}>
    <h2 className={`subtitleInTunnel !text-[#000000]  }`}>
       Memory
      </h2>
        <TunnelContainer color={'#E8F5E9'} />
  
   </div>
  )
}

export default MemoryTunnel
