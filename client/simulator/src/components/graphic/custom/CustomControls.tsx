import { Controls } from '@xyflow/react';
import { RedoDot, Ban, RotateCcw, ZoomIn, ZoomOut, Fullscreen } from 'lucide-react';
import DownloadButton from '../DownloadButton';

import { sendMessage } from '@/components/Message/sendMessage';
import { useDialog } from '@/context/panel/DialogContext';
import { useEffect, useState } from 'react';


interface CustomControlsProps {
  onToggleMinimap: () => void;
  onFitView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleInteractive: () => void;
}

export default function CustomControls({
  onFitView,
  onZoomIn,
  onZoomOut,
  // onToggleInteractive,
}: CustomControlsProps) {
  const { dialog } = useDialog();
  const [showControls, setShowControls] = useState(true);


  useEffect(() => {
    if(dialog && dialog.stop){
      setShowControls(false);
    }
  }, [dialog])

  return (
    <Controls
      showFitView={false}       
      showZoom={false}          
      showInteractive={false} 
    >
      { showControls && (
        <>
          <button className="react-flow__controls-button-custom_blue" onClick={() => sendMessage({event:"step"})}  title="Step">
            <RedoDot size={18}  />
          </button>
          <button className="react-flow__controls-button-custom_red " onClick={() => sendMessage({event:"stop"})}   title="Stop">
            <Ban size={16}  />
          </button>
          <button className="react-flow__controls-button-custom_green" onClick={() => sendMessage({event:"reset"})}  title="Reset">
            <RotateCcw size={16}  />
          </button>
        </>
      )}
      <button className="react-flow__controls-button-custom" onClick={onZoomIn} title="Zoom In">
        <ZoomIn size={16} />
      </button>
      <button className="react-flow__controls-button-custom" onClick={onZoomOut} title="Zoom Out">
        <ZoomOut  size={16}  />
      </button>

      <button className="react-flow__controls-button-custom" onClick={onFitView} title="FitView">
        <Fullscreen size={16}  />
      </button>

      {/* <button className="react-flow__controls-button-custom" onClick={onToggleInteractive} title="Toggle Interactive">
        <Lock size={16}  />
      </button> */}

      <DownloadButton />
    </Controls>
  );
}