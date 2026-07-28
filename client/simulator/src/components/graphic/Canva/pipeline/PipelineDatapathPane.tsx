import { useState, MouseEvent, useEffect } from "react";
import { createPortal } from "react-dom";
import { ReactFlow, useReactFlow, Edge, Background, MiniMap } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useProcessorFlow } from "../hooks/useProcessorFlow";

export type AppEdge = Edge & { disabled?: boolean };

import { nodeTypes, edgeTypes } from "../shared/constants";
import { baseEdges } from "./edges/baseEdges";

import { animateLineClick, animateLineHover, useEdgeGroups } from "../shared/conexions-controller/datapath-primitives";
import CustomControls from "../../custom/CustomControls";

import PipelineConexionsController from "./PipelineConexionsController";
import StagesPipeline from "@/components/panel/Sections/Tables/StagesPipeline";
import { usePipelineStagesSlot } from "@/context/graphic/PipelineStagesSlotContext";

import { useCustomOptionSimulate } from "@/context/shared/CustomOptionSimulate";

const defaultViewport = { x: 0, y: 0, zoom: 1.5 };

/**
 * The five-stage pipeline datapath pane (ADR-0005). Selected once at mount when
 * the host declares a pipeline CPU; reads the pipeline stages through its own
 * connection controller and draws the five-stage diagram. It also owns the
 * pipeline-stages table, which it portals into the shared tables row so the
 * monocycle pane never renders it and the tables stay CPU-blind. It shares no
 * state with the monocycle pane, so a change here cannot alter that diagram.
 */
export default function PipelineDatapathPane() {
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
  const { slotNode } = usePipelineStagesSlot();

  const [selectedGroup, setSelectedGroup] = useState<string[][]>([]);
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
    <>
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
        fitView={false}>
        <Background color="#000000" gap={20} size={2} />
        {minimapVisible && <MiniMap />}
        <CustomControls {...controlHandlers} />
        <PipelineConexionsController setEdges={setEdges} />
      </ReactFlow>
      {slotNode && createPortal(<StagesPipeline />, slotNode)}
    </>
  );
}
