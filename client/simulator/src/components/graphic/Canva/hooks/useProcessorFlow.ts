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

// El hook recibe como argumento las conexiones que son únicas para cada canvas
export const useProcessorFlow = (initialEdges: Edge[]) => {
  // Toda la lógica de estado y hooks se mueve aquí
  const initialNodes = useInitialNodes();
  const [nodes, , onNodesChange] = useNodesState(initialNodes);

  const combinedEdges = [...initialEdges, ...sharedEdges];
  const [edges, setEdges, onEdgesChange] = useEdgesState(combinedEdges);
  
  const [showMinimap, setShowMinimap] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [isInteractive, setIsInteractive] = useState(true);

  // Los manejadores de eventos compartidos también van aquí
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
    setEdges, // Exportamos setEdges para que InstructionEffect lo pueda usar
    isInteractive,
    // Agrupamos los handlers de los controles para mayor limpieza
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