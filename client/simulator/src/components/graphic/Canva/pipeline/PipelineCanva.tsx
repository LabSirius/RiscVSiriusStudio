import { ReactFlow, Background, MiniMap } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useProcessorFlow } from "../hooks/useProcessorFlow"; 

import { nodeTypes, edgeTypes } from "../shared/constants";
import { baseEdges } from "./edges/baseEdges"; 
import CustomControls from "../../custom/CustomControls";

const defaultViewport = { x: 0, y: 0, zoom: 1.5 };

export default function PipelineCanva() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onInit,
    isInteractive,
    controlHandlers,
    minimapVisible,
  } = useProcessorFlow(baseEdges);

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
    </ReactFlow>
  );
}