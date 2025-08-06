import { useState, MouseEvent } from "react";
import { ReactFlow, Edge, useReactFlow, Background, MiniMap } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

export type AppEdge = Edge & { disabled?: boolean }

import { useProcessorFlow } from "../hooks/useProcessorFlow"; 

import { nodeTypes, edgeTypes } from "../shared/constants";
import { baseEdges } from "./edges/baseEdges"; 
import CustomControls from "../../custom/CustomControls";
import { animateLineClick, animateLineHover } from "../../animateLine/animateLine";
import ActiveConexionsController from "../shared/active-conexions-controller/ActiveConexionsController";

const defaultViewport = { x: 0, y: 0, zoom: 1.5 };

export default function MonocycleCanva() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onInit,
    setEdges,
    isInteractive,
    controlHandlers,
    minimapVisible,
  } = useProcessorFlow(baseEdges);

  const { updateEdge } = useReactFlow();
  const [selectedGroup, setSelectedGroup] = useState<string[][]>([]);

  const handleEdgeClick = (_event: MouseEvent<Element>, edge: Edge): void => {
    const updatedGroups = animateLineClick(updateEdge, edge, edges, selectedGroup);
    setSelectedGroup(updatedGroups);
  };

  const handleEdgeMouseEnter = (_event: MouseEvent<Element>, edge: Edge): void => {
    if ((edge as AppEdge).disabled) return;
    animateLineHover(updateEdge, edge, edges, true);
  };

  const handleEdgeMouseLeave = (_event: MouseEvent<Element>, edge: Edge): void => {
    if ((edge as AppEdge).disabled) return;
    animateLineHover(updateEdge, edge, edges, false);
  };

  return (
    <ReactFlow
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      defaultViewport={defaultViewport}
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onInit={onInit}
      onEdgeClick={handleEdgeClick}
      onEdgeMouseEnter={handleEdgeMouseEnter}
      onEdgeMouseLeave={handleEdgeMouseLeave}
      style={{ backgroundColor: "#F7F9FB" }}
      minZoom={0.1}
      maxZoom={2}
      panOnDrag={isInteractive}
      elementsSelectable={isInteractive}
      fitView={false}
    >
      <Background color="#000000" gap={20} size={2} />
      {minimapVisible && <MiniMap />}
      <CustomControls {...controlHandlers} />
      <ActiveConexionsController setEdges={setEdges} />
    </ReactFlow>
  );
}