import { Controls } from '@xyflow/react';
import { Map } from 'lucide-react';

interface CustomControlsProps {
    onToggleMinimap: () => void;
}

export default function CustomControls({ onToggleMinimap }: CustomControlsProps) {
    return (
        <Controls>
            {/* Add a custom button for toggling the minimap */}
            <button
                className="react-flow__controls-button"
                onClick={onToggleMinimap}
                title="Toggle Minimap"
            >
                <Map size={16} />
            </button>
            {/* Your existing custom controls */}
        </Controls>
    );
}
