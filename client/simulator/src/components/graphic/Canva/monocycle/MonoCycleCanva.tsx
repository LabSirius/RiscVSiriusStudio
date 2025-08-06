import { useCallback, useState, MouseEvent, useEffect } from "react";
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
  ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { nodeTypes } from "../shared/constants";
import { edgeTypes } from "../shared/constants";

import { useInitialNodes } from "../shared/nodes/initialNodes"; // Nodes
import { initialEdges } from "./edges/initialEdges"; 
import { sharedEdges } from "../shared/edges/sharedEdges";



import CustomControls from "../../custom/CustomControls";


import { animateLineClick, animateLineHover } from "../../animateLine/animateLine";
import InstructionEffect from "./InstructionEffect";

const defaultViewport = { x: 0, y: 0, zoom: 1.5 };

export default function MonocycleCanva() {
  const initialNodes = useInitialNodes(); // Hook to get the initial nodes
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const combinedEdges = [...initialEdges, ...sharedEdges];
  const [edges, setEdges, onEdgesChange] = useEdgesState(combinedEdges);
  const [showMinimap, setShowMinimap] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [isInteractive, setIsInteractive] = useState(true);
  const { updateEdge } = useReactFlow();
  const [selectedGroup, setSelectedGroup] = useState<string[][]>([]);

  useEffect(() => {
    console.log("Selected group changed:", selectedGroup);
  }, [selectedGroup]);

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

  const handleEdgeClick = (_event: MouseEvent<Element>, edge: Edge): void => {
    const updatedGroups = animateLineClick(updateEdge, edge, edges, selectedGroup);
    setSelectedGroup(updatedGroups);
};

  const handleEdgeMouseEnter = (
    _event: MouseEvent<Element>,
    edge: Edge & { disabled?: boolean }
  ): void => {
    if (edge.disabled) return;
    animateLineHover(updateEdge, edge, edges, true);
  };

  const handleEdgeMouseLeave = (
    _event: MouseEvent<Element>,
    edge: Edge & { disabled?: boolean }
  ): void => {
    if (edge.disabled) return;
    animateLineHover(updateEdge, edge, edges, false);
  };

  return (
    <ReactFlow
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      defaultViewport={defaultViewport}
      onEdgeClick={handleEdgeClick}
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
      style={{ backgroundColor: "#F7F9FB" }}
      minZoom={0.1}
      maxZoom={2}
      panOnDrag={isInteractive}
      elementsSelectable={isInteractive}>
      <Background color="#000000" gap={20} size={2} />
      {showMinimap && <MiniMap />}
      <CustomControls
        onFitView={handleFitView}
        onToggleMinimap={() => setShowMinimap((prev) => !prev)}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onToggleInteractive={handleToggleInteractive}
      />

      <InstructionEffect setEdges={setEdges} />
    </ReactFlow>
  );
}
