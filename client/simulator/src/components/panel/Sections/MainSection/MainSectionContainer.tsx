import React, { useState, useEffect } from 'react';
import MainSection from './MainSection';
import { useCustomOptionSimulate } from '@/context/shared/CustomOptionSimulate';

const MainSectionContainer: React.FC = () => {

  const { requestFitView } = useCustomOptionSimulate();

  const [height, setHeight] = useState<number>(() => window.innerHeight * 0.35);
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
    window.requestAnimationFrame(() => {
      const newHeight = startHeight + (startY - e.clientY);
      if (newHeight >= 10) {
        setHeight(newHeight);
      }
    });
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    requestFitView(); 
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
    <div className={`flex `}>
      <div style={{ height: `${height}px` }} className="relative w-full overflow-y-hidden overflow-hidden">
        
        <div
          className="flex absolute top-0 left-0 min-w-full h-[.3rem]  cursor-ns-resize bg-gray-500 z-10"
          onMouseDown={handleMouseDown}
        />
        <div className="h-full p-4 ">
          <MainSection />
        </div>
      </div>
    </div>
  );
};

export default MainSectionContainer;