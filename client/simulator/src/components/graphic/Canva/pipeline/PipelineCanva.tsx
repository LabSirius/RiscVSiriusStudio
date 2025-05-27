import {
  useCallback,
  useState,
} from "react";
import {
  ReactFlow,
  // Edge,
  // useReactFlow,
  addEdge,
  Background,
  useNodesState,
  useEdgesState,
  MiniMap,
  Connection,
  ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { nodeTypes } from "./constants";
import { edgeTypes } from "./constants";

import { initialEdges } from './edges/initialEdges'; //Conections between npdes
import { sharedEdges } from "../shared/edges/sharedEdges";

import { useInitialNodes } from "../shared/nodes/initialNodes"; // Nodes


import CustomControls from "../../custom/CustomControls";

//import { animateLine } from '../../animateLine/animateLine';
//import InstructionEffect from './InstructionEffect';

const defaultViewport = { x: 0, y: 0, zoom: 1.5 };

export default function PipelineCanva() {
  const initialNodes = useInitialNodes(); 
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const combinedEdges = [...initialEdges, ...sharedEdges]
    const [edges, setEdges, onEdgesChange] = useEdgesState(combinedEdges);
  const [showMinimap, setShowMinimap] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [isInteractive, setIsInteractive] = useState(true);
  //const { updateEdge } = useReactFlow();

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

  // const handleEdgeMouseEnter = (
  //   _event: MouseEvent<Element>,
  //   edge: Edge & { disabled?: boolean }
  // ): void => {
  //   if (edge.disabled) return;
  //   animateLine(updateEdge, edge, edges, true);
  // };

  // const handleEdgeMouseLeave = (
  //   _event: MouseEvent<Element>,
  //   edge: Edge & { disabled?: boolean }
  // ): void => {
  //   if (edge.disabled) return;
  //   animateLine(updateEdge, edge, edges, false);
  // };

  return (
    <ReactFlow
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      defaultViewport={defaultViewport}
      // onEdgeMouseEnter={handleEdgeMouseEnter}
      // onEdgeMouseLeave={handleEdgeMouseLeave}
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

      {/*<InstructionEffect setEdges={setEdges}/>*/}
    </ReactFlow>
  );
}
