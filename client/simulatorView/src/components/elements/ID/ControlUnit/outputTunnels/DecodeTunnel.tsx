import TunnelContainer from "./TunnelContainer";
import { useOverlay } from "@/context/OverlayContext";

const DecodeTunnel = () => {
  const { setOverlayDecodeActive } = useOverlay();

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setOverlayDecodeActive(true)}
      onMouseLeave={() => setOverlayDecodeActive(false)}
    >
      <h2 className="subtitleInTunnel">Decode</h2>
      <TunnelContainer />
    </div>
  );
};

export default DecodeTunnel;
