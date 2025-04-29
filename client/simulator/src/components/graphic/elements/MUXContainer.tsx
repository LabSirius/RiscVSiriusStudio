import { useSimulator } from '@/context/shared/SimulatorContext';

function Mux2_1() {
  const { operation } = useSimulator();
  const isUploadMemory = operation === "uploadMemory";

  return (
    <svg width="100%" height="100%" viewBox="0 0 90 220">
      <polygon
        className={isUploadMemory ? 'animate-border-pulse' : ''}
        points="70,55 70,161.4 0,220 0,0"
        fill="none"
        stroke="#AAAAAA"
        strokeWidth="6"
      />
    </svg>
  );
}

export default Mux2_1;
