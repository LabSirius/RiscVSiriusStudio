import { useSimulator } from "@/context/shared/SimulatorContext";

function Mux3_1({ signal }: { signal: string }) {
  const { operation } = useSimulator();
  const isUploadMemory = operation === "uploadMemory";

  return (
    <div className="relative">
      <svg
        className="svg-container-lift"
        width="100%"
        height="100%"
        viewBox="0 0 90 220"
        style={{ overflow: "visible" }}>
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#000" floodOpacity="0.45" />
          </filter>
        </defs>

        <polygon
          className={`${isUploadMemory ? "animate-border-pulse" : ""} polygon-shadow`}
          points="70,55 70,161.4 0,220 0,0"
          fill="none"
          stroke="#AAAAAA"
          strokeWidth="6"
        />
      </svg>

      {!isUploadMemory && (signal === "00" || signal === "10") && (
        <div
          style={{ transform: signal === "00" ? "" : "scaleY(-1)" }}
          className={`absolute transform ${
            signal === "00" ? "top-[6.3rem]" : "top-[3rem]"
          } -translate-y-1/2 `}>
          <svg width="50" height="60" viewBox="0 0 50 60" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 50 H20 V4 H50" stroke="#3B59B6" stroke-width="4" fill="none" />
          </svg>
        </div>
      )}

      {!isUploadMemory && signal === "01" && (
        <div className="absolute transform top-[3.1rem]">
          <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="25" x2="50" y2="25" stroke="#3B59B6" stroke-width="4" fill="none" />
          </svg>
        </div>
      )}
    </div>
  );
}

export default Mux3_1;
