import TunnelContainer from "./TunnelContainer";
import { useOverlay } from "@/context/graphic/OverlayContext";

const DecodeTunnel = () => {
  const { setOverlayDecodeActive } = useOverlay();

  return (
    <div
      className="relative w-full ml-[1rem] rotate-270"
      onMouseEnter={() => setOverlayDecodeActive(true)}
      onMouseLeave={() => setOverlayDecodeActive(false)}
    >
      <h2 className="subtitleInTunnel">Decode</h2>
      <TunnelContainer color="#E3F2FD"/>
    </div>
  );
};

export default DecodeTunnel;
