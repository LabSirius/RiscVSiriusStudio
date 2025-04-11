import { FC } from 'react';
import { useOperation } from '@/context/panel/OperationContext';

interface ContainerProps {
  height: number;
  active?: boolean;
}

const Container: FC<ContainerProps> = ({ height, active = false }: ContainerProps) => {
  const { operation } = useOperation();

  const isUploadMemory = operation === "uploadMemory";
  const borderColor = active ? '#555555' : isUploadMemory ? '#AAAAAA' : '#D3D3D3';

  return (
    <div
      className="relative w-full overflow-visible"
      style={{ height: `${height}rem` }}
    >
      <div
        className={`absolute rounded-[20px] border-[5.5px] ${isUploadMemory ? 'animate-border-pulse' : ''}`}
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
