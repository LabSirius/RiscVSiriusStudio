import { Controls } from '@xyflow/react';
import { ZoomIn, ZoomOut, Fullscreen, Map } from 'lucide-react';
import DownloadButton from '../DownloadButton';

interface CustomControlsProps {
  onToggleMinimap: () => void;
  onFitView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleInteractive: () => void;
}

export default function CustomControls({
  onToggleMinimap,
  onFitView,
  onZoomIn,
  onZoomOut,
  // onToggleInteractive,
}: CustomControlsProps) {
  return (
    <Controls
      showFitView={false}       
      showZoom={false}          
      showInteractive={false} 
    >
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

      <button className="react-flow__controls-button-custom" onClick={onToggleMinimap} title="Toggle Minimap">
        <Map  size={16}  />
      </button>

      <DownloadButton />
    </Controls>
  );
}