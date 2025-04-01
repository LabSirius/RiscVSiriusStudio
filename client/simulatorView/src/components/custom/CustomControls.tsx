import { Controls } from '@xyflow/react';
import { Map } from 'lucide-react';
import DownloadButton from '../DownloadButton';

interface CustomControlsProps {
    onToggleMinimap: () => void;
}

export default function CustomControls({ onToggleMinimap }: CustomControlsProps) {
    return (
        <Controls>
            {/* Custom button for toggling the minimap */}
            <button
                className="react-flow__controls-button"
                onClick={onToggleMinimap}
                title="Toggle Minimap"
            >
                <Map size={16} />
            </button>
            {/* Download button */}
            <DownloadButton />
        </Controls>
    );
}
