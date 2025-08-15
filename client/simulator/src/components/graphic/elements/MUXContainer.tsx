import { useSimulator } from "@/context/shared/SimulatorContext";

function Mux2_1({signal, islui} : {signal: string, islui?: boolean}) {
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

      {!isUploadMemory && !islui && (
        <div style={{ transform: signal === "0" ? "" : "scaleY(-1)" }} className={`absolute transform ${signal === "0" ? "top-[5.8rem]" : "top-[3.7rem]" } -translate-y-1/2 ` }>
        <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" >
          <path
            id="signal-path-1"
            d="M0 40 H25 V8 H50"
            stroke="#3B59B6"
            stroke-width="4"
            fill="none"
          />
        </svg>
      </div>
      )}
      
    </div>
  );
}

export default Mux2_1;
