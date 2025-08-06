import { useCallback, useState } from "react";
import {
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  ReactFlowInstance,
} from "@xyflow/react";

import { useInitialNodes } from "../shared/nodes/initialNodes";
import { sharedEdges } from "../shared/edges/sharedEdges";

export const useProcessorFlow = (initialEdges: Edge[]) => {
  const initialNodes = useInitialNodes();
  const [nodes, , onNodesChange] = useNodesState(initialNodes);

  const combinedEdges = [...initialEdges, ...sharedEdges];
  const [edges, setEdges, onEdgesChange] = useEdgesState(combinedEdges);
  
  const [showMinimap, setShowMinimap] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [isInteractive, setIsInteractive] = useState(true);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const handleFitView = () => reactFlowInstance?.fitView({ padding: 0.01 });
  const handleZoomIn = () => reactFlowInstance?.zoomIn?.();
  const handleZoomOut = () => reactFlowInstance?.zoomOut?.();
  const handleToggleInteractive = () => setIsInteractive((prev) => !prev);
  const handleToggleMinimap = () => setShowMinimap((s) => !s);

  const onInit = (instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
    instance.fitView({ padding: 0.01 });
  };

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onInit,
    setEdges, 
    isInteractive,
    controlHandlers: {
      onFitView: handleFitView,
      onZoomIn: handleZoomIn,
      onZoomOut: handleZoomOut,
      onToggleInteractive: handleToggleInteractive,
      onToggleMinimap: handleToggleMinimap,
    },
    minimapVisible: showMinimap,
  };
};