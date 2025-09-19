import { Controls } from '@xyflow/react';
import { RedoDot, Ban, RotateCcw, ZoomIn, ZoomOut, Fullscreen, Copy } from 'lucide-react';
import DownloadSVGButton from '../DownloadSVGButton';
import { sendMessage } from '@/components/Message/sendMessage';
import { useDialog } from '@/context/panel/DialogContext';
import { useEffect, useState } from 'react';

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import DownloadPNGButton from '../DownloadPNGButton';

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
}: CustomControlsProps) {
  const { dialog } = useDialog();
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    if (dialog && dialog.stop) {
      setShowControls(false);
    }
  }, [dialog]);

  return (
    <Controls showFitView={false} showZoom={false} showInteractive={false}>
      {showControls && (
        <>
          <button
            className="react-flow__controls-button-custom_blue"
            onClick={() => sendMessage({ event: 'step' })}
            title="Step"
          >
            <RedoDot size={18} />
          </button>
          <button
            className="react-flow__controls-button-custom_red"
            onClick={() => sendMessage({ event: 'stop' })}
            title="Stop"
          >
            <Ban size={16} />
          </button>
          <button
            className="react-flow__controls-button-custom_green"
            onClick={() => sendMessage({ event: 'reset' })}
            title="Reset"
          >
            <RotateCcw size={16} />
          </button>
        </>
      )}

      <HoverCard openDelay={200} closeDelay={100}>
        <HoverCardTrigger asChild>
          <button
            className="react-flow__controls-button-custom"
            onClick={onFitView}
            title="Fit View"
          >
            <Fullscreen size={16} />
          </button>
        </HoverCardTrigger>
        
        <HoverCardContent side="right" align="center" className="w-auto p-0 ml-2 border-none bg-transparent">
          <div className="flex bg-white rounded-lg shadow-md react-flow__controls">
            <button
              className="react-flow__controls-button-custom"
              onClick={onZoomIn}
              title="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
            <button
              className="react-flow__controls-button-custom"
              onClick={onZoomOut}
              title="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>
          </div>
        </HoverCardContent>
      </HoverCard>
      
      <HoverCard openDelay={200} closeDelay={100}>
        <HoverCardTrigger asChild>
          <button
            className="react-flow__controls-button-custom"
            onClick={() => console.log('copy')}
            title="Copy"
          >
            <Copy size={16} />
          </button>
        </HoverCardTrigger>
        
        <HoverCardContent side="right" align="center" className="w-auto p-0 ml-2 border-none bg-transparent">
          <div className="flex bg-white rounded-lg shadow-md react-flow__controls">
            <DownloadSVGButton />
            <DownloadPNGButton />
          </div>
        </HoverCardContent>
      </HoverCard>
    </Controls>
  );
}