import { Edge } from "@xyflow/react";
import ConexionsController from "../shared/conexions-controller/ConexionsController";
import { useDataMonocycleConexions } from "../shared/conexions-controller/useDataMonocycleConexions";

/**
 * The monocycle pane's connection controller: it consumes only the monocycle
 * `enabledEdges` kernel and hands its edge sets to the shared renderer. The
 * pipeline kernel is never mounted here (ADR-0005).
 */
const MonocycleConexionsController = ({
  setEdges,
}: {
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
}) => {
  const { enabledEdges, disabledEdges } = useDataMonocycleConexions();
  return (
    <ConexionsController setEdges={setEdges} enabledEdges={enabledEdges} disabledEdges={disabledEdges} />
  );
};

export default MonocycleConexionsController;
