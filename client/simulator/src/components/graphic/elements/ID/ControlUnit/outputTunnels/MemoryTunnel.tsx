import { useCurrentInst } from "@/context/graphic/CurrentInstContext";
import TunnelContainer from "./TunnelContainer"
import { useOverlay } from "@/context/graphic/OverlayContext";
import { useSimulator } from "@/context/shared/SimulatorContext";


const MemoryTunnel = () => {
  const { setOverlayMemoryActive } = useOverlay();
  const { currentType } = useCurrentInst();
  const { isFirstStep} = useSimulator();

  return (
    <div className="relative w-full ml-[17rem] rotate-270"
    onMouseEnter={() => setOverlayMemoryActive(true)}
    onMouseLeave={() => setOverlayMemoryActive(false)}>
    <h2 className={`subtitleInTunnel ${(currentType === "L" || currentType === "S" || !isFirstStep) ? '!text-[#000000]' : '!text-[#D3D3D3]'  }`}>
       Memory
      </h2>
        <TunnelContainer color={'#E8F5E9'} />
  
   </div>
  )
}

export default MemoryTunnel
