import { useCallback, useState, MouseEvent } from 'react';
import {
  ReactFlow,
  Edge,
  useReactFlow,
  addEdge,
  Background,
  useNodesState,
  useEdgesState,
  MiniMap,
  Connection,
  ReactFlowInstance
  
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { nodeTypes } from './constants';
import { edgeTypes } from './constants';
import { initialNodes } from './data/nodes/initialNodes'; // Nodes
import { initialEdges } from './data/edges/initialEdges'; //Conecctions between npdes

import CustomControls from '../ui/custom/CustomControls';

import { animateLine } from '../animateLine/animateLine';

export default function Canva() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [showMinimap, setShowMinimap] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [isInteractive, setIsInteractive] = useState(true); 
  const { updateEdge } = useReactFlow();

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const handleFitView = () => {
    reactFlowInstance?.fitView({ padding: 0.01 });
  };

  const handleZoomIn = () => {
    reactFlowInstance?.zoomIn?.();
  };

  const handleZoomOut = () => {
    reactFlowInstance?.zoomOut?.();
  };

  const handleToggleInteractive = () => {
    setIsInteractive((prev) => !prev);
  };


  const handleEdgeMouseEnter = (
    _event: MouseEvent<Element>, 
    edge: Edge
  ): void => {
    animateLine(updateEdge, edge, true);
  };
  
  const handleEdgeMouseLeave = (
    _event: MouseEvent<Element>, 
    edge: Edge
  ): void => {
    animateLine(updateEdge, edge, false);
  };

  return (
    <ReactFlow
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onEdgeMouseEnter={handleEdgeMouseEnter}
      onEdgeMouseLeave={handleEdgeMouseLeave}
      nodes={nodes}
      onInit={(instance) => {
        setReactFlowInstance(instance);
        instance.fitView({ padding: 0.01 });
      }}
      fitView={false}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      style={{ backgroundColor: '#F7F9FB' }}
      minZoom={0.1}
      maxZoom={2}
      panOnDrag={isInteractive} 
      elementsSelectable={isInteractive} 
    >
      <Background color="#FF0000" gap={20} size={2} />
      {showMinimap && <MiniMap />}
      <CustomControls
        onFitView={handleFitView}
        onToggleMinimap={() => setShowMinimap((prev) => !prev)}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onToggleInteractive={handleToggleInteractive}
      />
    </ReactFlow>
  );
}
