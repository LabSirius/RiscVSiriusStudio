import { FC } from 'react';
import { useSimulator } from '@/context/shared/SimulatorContext';

interface ContainerProps {
  height: number;
  active?: boolean;
}

const Container: FC<ContainerProps> = ({ height, active = false }) => {
  const { operation } = useSimulator();

  const isUploadMemory = operation === "uploadMemory";
  const borderColor = active ? '#555555' : isUploadMemory ? '#AAAAAA' : '#D3D3D3';

  return (
    <div
      className="relative w-full overflow-visible z-1000000"
      style={{ height: `${height}rem` }}
    >
      <div
        className={`
          absolute rounded-[20px] borderElementContainer
          custom-shadow
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
