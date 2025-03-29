import { Handle, Position } from '@xyflow/react';
import LargeContainer from './LargeContainer';

export default function PCSVG() {
  return (
    <div style={{ position: 'relative' }}>
        <LargeContainer />
        <Handle  type="source"
        position={Position.Right}
        style={{ transform: 'translateX(-50%)' }}/>
    </div>
    
  );
}
