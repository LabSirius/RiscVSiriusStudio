import { Handle, Position } from '@xyflow/react';
import ContainerSVG from '../../ContainerSVG';
import LabelValueContainer from './LabelValueContainer';

interface HandlerConfig {
  id: string;
  position: Position;
  className: string;
  style?: React.CSSProperties;
}

export default function ALU() {
  const leftInputHandlers: HandlerConfig[] = [
    { id: 'muxA', position: Position.Left, className: 'input', style: { top: '4.7rem' } },
    { id: 'muxB', position: Position.Left, className: 'input', style: { top: '15rem' } },
  ];

  const bottomInputHandler: HandlerConfig = {
    id: 'aluOp',
    position: Position.Bottom,
    className: 'input',
  };

  const outputHandlers: HandlerConfig[] = [
    { id: 'dataMemory', position: Position.Right, className: 'output' },
  ];

  return (
    <div className="w-full">
      <div className="relative w-full h-full">
        <h2 className="titleInElement top-[50%] left-[13%] -translate-x-[13%] -translate-y-[50%]">
          ALU
        </h2>
        <ContainerSVG height={19.9} active={true} />
        <LabelValueContainer />
      </div>

      {leftInputHandlers.map((handler) => (
        <Handle
          key={handler.id}
          type="target"
          id={handler.id}
          position={handler.position}
          className={handler.className}
          style={handler.style}
        />
      ))}

      <Handle
        key={bottomInputHandler.id}
        type="target"
        id={bottomInputHandler.id}
        position={bottomInputHandler.position}
        className={bottomInputHandler.className}
      />

      {outputHandlers.map((handler) => (
        <Handle
          key={handler.id}
          type="source"
          id={handler.id}
          position={handler.position}
          className={handler.className}
        />
      ))}
    </div>
  );
}
