import { Edge } from "@xyflow/react";
import ConexionsController from "../shared/conexions-controller/ConexionsController";
import { useDataPipelineConexions } from "../shared/conexions-controller/useDataPipelineConexions";

/**
 * The pipeline pane's connection controller: it consumes only the pipeline
 * `enabledEdges` kernel and hands its edge sets to the shared renderer. The
 * monocycle kernel is never mounted here (ADR-0005).
 */
const PipelineConexionsController = ({
  setEdges,
}: {
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
}) => {
  const { enabledEdges, disabledEdges } = useDataPipelineConexions();
  return (
    <ConexionsController setEdges={setEdges} enabledEdges={enabledEdges} disabledEdges={disabledEdges} />
  );
};

export default PipelineConexionsController;
