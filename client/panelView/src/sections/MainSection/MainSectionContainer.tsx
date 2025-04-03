import React, { useState, useEffect } from 'react';
import MainSection from './MainSection';

const ResizableBottomContainer: React.FC = () => {
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

  // Añadimos y removemos los listeners a nivel global
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
    <div className="fixed bottom-0 left-0 w-full">
      <div style={{ height: `${height}px` }} className="relative">
        <div
          className="absolute top-0 left-0 w-full h-[.1rem] cursor-ns-resize bg-gray-500"
          onMouseDown={handleMouseDown}
        />
        <div className="p-4">
          <MainSection />
        </div>
      </div>
    </div>
  );
};

export default ResizableBottomContainer;
