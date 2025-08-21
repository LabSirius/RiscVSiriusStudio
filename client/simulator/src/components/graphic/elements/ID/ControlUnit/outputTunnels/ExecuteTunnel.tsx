import TunnelContainer from "./TunnelContainer"
import { useOverlay } from "@/context/graphic/OverlayContext";

const ExecuteTunnel = () => {
  const { setOverlayExecuteActive } = useOverlay();

  return (
    <div className="relative w-full ml-[6rem] rotate-270"
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
