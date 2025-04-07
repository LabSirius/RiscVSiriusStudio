import { FC } from 'react';

interface ContainerProps {
  height: number;
  active?: boolean;
}

const Container: FC<ContainerProps> = ({ height, active = false } : ContainerProps) => {
  return (
    <div
      className="relative w-full overflow-visible"
      style={{ height: `${height}rem` }}
    >
      <div
        className="absolute rounded-[20px] border-[5.5px]"
        style={{
          borderColor: active ? '#555555' : '#D3D3D3',
          width: '100%',
          height: '100%',
        }}
      />

      
     
    </div>
  );
};

export default Container;
