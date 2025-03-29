import ContainerSVG from './ContainerSvg';
import { Handle, Position } from '@xyflow/react';

export default function PCSVG() {
  return (
    <div style={{ position: 'relative' }}>
        <ContainerSVG />
        <Handle  type="source"
        position={Position.Right}
        style={{ transform: 'translateX(-50%)' }}/>
    </div>
    
  );
}
