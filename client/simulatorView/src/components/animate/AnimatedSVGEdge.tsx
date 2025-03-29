import { BaseEdge, EdgeProps, getSmoothStepPath } from '@xyflow/react';

const AnimatedSVGEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
}: EdgeProps) => {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 10,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} />
      <circle r="10" fill="#ff0072">
        <animateMotion 
          dur="1s" 
          repeatCount="indefinite"
          path={edgePath}
        />
      </circle>
    </>
  );
};

export default AnimatedSVGEdge;
