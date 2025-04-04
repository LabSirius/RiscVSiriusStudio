import React, { useState, useEffect } from 'react';
import MainSection from './MainSection';
import { useTheme } from '../../ui/theme/theme-provider';

const MainSectionContainer: React.FC = () => {
  const { theme } = useTheme();
  const [height, setHeight] = useState<number>(400); 
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [startY, setStartY] = useState<number>(0);
  const [startHeight, setStartHeight] = useState<number>(200);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsResizing(true);
    setStartY(e.clientY);
    setStartHeight(height);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    const newHeight = startHeight + (startY - e.clientY);
    if (newHeight >= 10) {
      setHeight(newHeight);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, startHeight, startY]);

  return (
    <div className={`flex relative w-full overflow-hidden  bg-${theme==="dark" ? "[#1a1a1a]" : "white"}`}>
      <div style={{ height: `${height}px` }} className="relative overflow-y-hidden w-full">
        <div
          className="flex absolute top-0 left-0 min-w-full h-[.1rem]   cursor-ns-resize bg-gray-500 z-1000"
          onMouseDown={handleMouseDown}
        />
        <div className="p-4 h-full overflow-hidden ">
          <MainSection />
        </div>
      </div>
    </div>
  );
};

export default MainSectionContainer;
