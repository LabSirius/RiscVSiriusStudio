import React, { useState, useEffect } from 'react';
import MainSection from './MainSection';

const MainSectionContainer: React.FC = () => {
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
    <div className="fixed bottom-0 left-0 w-full overflow-hidden ">
      <div style={{ height: `${height}px` }} className="relative overflow-y-hidden">
        <div
          className="absolute top-0 left-0 w-full h-[.1rem]  cursor-ns-resize bg-gray-500 z-1000"
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
