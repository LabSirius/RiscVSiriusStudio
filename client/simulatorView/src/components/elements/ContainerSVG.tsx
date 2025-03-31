import { FC } from 'react';

interface ContainerProps {
  height: number;
}

const Container: FC<ContainerProps> = ({ height }) => {
  return (
    <div
      className="relative w-full overflow-visible"
      style={{ height: `${height}rem` }}
    >
      <div
        className="absolute rounded-[20px] border-[2px]"
        style={{
          borderColor: "#555555",
          width: '100%',
          height: '100%',
        }}
      />

      
     
    </div>
  );
};

export default Container;
