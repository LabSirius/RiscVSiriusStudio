import { FC } from 'react';
import { useSimulator } from '@/context/shared/SimulatorContext';

interface ContainerProps {
  height: number;
  active?: boolean;
  translate?: boolean
}

const Container: FC<ContainerProps> = ({ height, active = false, translate = true}) => {
  const { operation } = useSimulator();

  const isUploadMemory = operation === "uploadMemory"; 
  const borderColor = active ? '#555555' : isUploadMemory ? '#AAAAAA' : '#D3D3D3';

  return (
    <div
      className="relative w-full overflow-visible z-1 "
      style={{ height: `${height}rem` }}
    >
      <div
        className={`
          absolute rounded-[20px] borderElementContainer
          ${translate ? "custom-shadow" : "custom-shadow-without-translate"}
          ${isUploadMemory ? 'animate-border-pulse' : ''}
        `}
        style={{
          borderColor,
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
};

export default Container;
