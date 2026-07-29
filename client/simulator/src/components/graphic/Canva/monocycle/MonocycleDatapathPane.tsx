import { useState, MouseEvent, useEffect } from "react";
import { ReactFlow, Edge, useReactFlow, Background, MiniMap } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

export type AppEdge = Edge & { disabled?: boolean };

import { useProcessorFlow } from "../hooks/useProcessorFlow";

import { nodeTypes, edgeTypes } from "../shared/constants";
import { baseEdges } from "./edges/baseEdges";

import { animateLineClick, animateLineHover, useEdgeGroups } from "../shared/conexions-controller/datapath-primitives";
import CustomControls from "../../custom/CustomControls";

import MonocycleConexionsController from "./MonocycleConexionsController";

import { useCustomOptionSimulate } from "@/context/shared/CustomOptionSimulate";
import { useNodeScreenshot } from "../../screenshot/useNodeScreenshot";

const defaultViewport = { x: 0, y: 0, zoom: 1.5 };

/**
 * The single-cycle datapath pane (ADR-0005). Selected once at mount when the
 * host declares a monocycle CPU; reads the monocycle wires through its own
 * connection controller and draws the single-cycle diagram. It shares no state
 * with the pipeline pane, so a change here cannot alter the pipeline diagram.
 */
export default function MonocycleDatapathPane() {
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

  const { fitView, updateEdge } = useReactFlow();
  const { fitViewTrigger } = useCustomOptionSimulate();
  const edgeGroups = useEdgeGroups();

  useEffect(() => {
    if (fitViewTrigger > 0) {
      setTimeout(() => {
        fitView({
          duration: 400,
          padding: 0.01,
        });
      }, 0);
    }
  }, [fitViewTrigger, fitView]);

  const [selectedGroup, setSelectedGroup] = useState<string[][]>([]);
  const { onNodeMouseEnter, onNodeMouseLeave, screenshotToolbar } = useNodeScreenshot();

  const handleEdgeClick = (_event: MouseEvent<Element>, edge: Edge): void => {
    const updatedGroups = animateLineClick(updateEdge, edge, edges, selectedGroup, edgeGroups);
    setSelectedGroup(updatedGroups);
  };

  const handleEdgeMouseEnter = (_event: MouseEvent<Element>, edge: Edge): void => {
    if ((edge as AppEdge).disabled) return;
    animateLineHover(updateEdge, edge, edges, edgeGroups, true);
  };

  const handleEdgeMouseLeave = (_event: MouseEvent<Element>, edge: Edge): void => {
    if ((edge as AppEdge).disabled) return;
    animateLineHover(updateEdge, edge, edges, edgeGroups, false);
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
      onNodeMouseEnter={onNodeMouseEnter}
      onNodeMouseLeave={onNodeMouseLeave}
      style={{ backgroundColor: "#F7F9FB" }}
      minZoom={0.1}
      maxZoom={2}
      panOnDrag={isInteractive}
      elementsSelectable={isInteractive}
      fitView={false}>
      <Background color="#000000" gap={20} size={2} />
      {minimapVisible && <MiniMap />}
      <CustomControls {...controlHandlers} />
      {screenshotToolbar}
      <MonocycleConexionsController setEdges={setEdges} />
    </ReactFlow>
  );
}
