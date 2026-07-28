import { useEffect } from "react";
import { Edge } from "@xyflow/react";
import { useSimulator } from "@/context/shared/SimulatorContext";
import { useActiveEdges } from "@/context/graphic/ActiveEdgesContext";

interface ConexionsControllerProps {
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  enabledEdges: string[];
  disabledEdges: string[];
}

/**
 * CPU-independent renderer of a datapath's lit/dimmed wires: given the enabled
 * and disabled edge ids a pane's own `enabledEdges` kernel produced, it pushes
 * the active set to context and restyles the ReactFlow edges. It never chooses
 * which kernel runs — each pane wires in its own (`MonocycleConexionsController`
 * / `PipelineConexionsController`), so neither CPU's controller can run in the
 * other's pane (ADR-0005).
 */
const ConexionsController: React.FC<ConexionsControllerProps> = ({
  setEdges,
  enabledEdges,
  disabledEdges,
}) => {
  const { operation } = useSimulator();
  const { setActiveEdges } = useActiveEdges();

  useEffect(() => {
    if (enabledEdges) {
      setActiveEdges(enabledEdges);
    }
  }, [enabledEdges, setActiveEdges]);

  useEffect(() => {
    if (operation === "uploadMemory") {
      setEdges(prevEdges =>
        prevEdges.map(edge => ({
          ...edge,
          disabled: false,
          style: { ...edge.style, stroke: "#3B59B6" },
          data: { ...edge.data, selected: false },
        }))
      );
      return;
    }

    setEdges(prevEdges =>
      prevEdges.map(edge => {
        const isDisabled = disabledEdges.includes(edge.id);

        const strokeColor = isDisabled
          ? "#D3D3D3"
          : edge.data?.selected ? "#E91E63" : "#3B59B6";

        return {
          ...edge,
          disabled: isDisabled,
          style: { ...edge.style, stroke: strokeColor },
        };
      })
    );
  }, [disabledEdges, operation, setEdges]);

  return null;
};

export default ConexionsController;
