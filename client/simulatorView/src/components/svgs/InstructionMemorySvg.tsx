import ContainerSVG from './ContainerSvg';
import { Handle , Position} from '@xyflow/react';

export default function InstructionMemorySvg() {
  return (
    <div style={{ position: 'relative' }}>
      <ContainerSVG />
      <Handle  type="target"
        position={Position.Left}
        style={{ transform: 'translateX(-50%)' }} />
      </div>
  );
}
