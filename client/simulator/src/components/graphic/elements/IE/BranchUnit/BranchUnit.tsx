import { Handle, Position } from '@xyflow/react';
import ContainerSVG from '../../ContainerSVG';
import LabelValueContainer from './LabelValueContainer';
import { useSimulator } from '@/context/shared/SimulatorContext';

interface HandlerConfig {
  id: string;
  type: 'source' | 'target';
  position: Position;
  style?: React.CSSProperties;
}

export default function BranchUnit() {
  const { operation } = useSimulator();

  const handlers: HandlerConfig[] = [
    {
      id: 'RS2',
      type: 'target',
      position: Position.Left,
      style: { top: '2.5rem' },
    },
    {
      id: 'RS1',
      type: 'target',
      position: Position.Left,
      style: { top: '7rem' },
    },
    {
      id: 'brOp',
      type: 'target',
      position: Position.Bottom,
    },
    {
      id: 'branch_output',
      type: 'source',
      position: Position.Right,
    },
  ];

  return (
    <div className="w-full">
      <div className="relative w-full h-full">
        <h2 className="titleInElement top-[50%] left-[73.5%] -translate-x-[73.5%] -translate-y-[50%]">
          Branch Unit
        </h2>
        <ContainerSVG height={10.2} active={true} />
        {operation !== 'uploadMemory' && <LabelValueContainer />}
      </div>

      {handlers.map((h) => (
        <Handle
          key={h.id}
          id={h.id}
          type={h.type}
          position={h.position}
          className={h.type === 'source' ? 'output' : 'input'}
          style={h.style}
        />
      ))}
    </div>
  );
}
