import { createContext, useContext, useState, ReactNode } from "react";

/**
 * A CPU-blind mount point for the pipeline-stages table (ADR-0005).
 *
 * The stages table is owned by `PipelineDatapathPane`, but it belongs, visually,
 * in the shared tables row — not over the datapath diagram. Rather than have the
 * shared tables reach for a `typeSimulator === "pipeline"` gate, they render an
 * empty slot here; the pipeline pane portals its table into that slot, and the
 * monocycle pane leaves it empty. Ownership stays with the pane; placement stays
 * with the tables; neither knows the other's CPU.
 */
interface PipelineStagesSlotContextType {
  slotNode: HTMLElement | null;
  setSlotNode: (node: HTMLElement | null) => void;
}

const PipelineStagesSlotContext = createContext<PipelineStagesSlotContextType>({
  slotNode: null,
  setSlotNode: () => {},
});

export const usePipelineStagesSlot = () => useContext(PipelineStagesSlotContext);

export const PipelineStagesSlotProvider = ({ children }: { children: ReactNode }) => {
  const [slotNode, setSlotNode] = useState<HTMLElement | null>(null);
  return (
    <PipelineStagesSlotContext.Provider value={{ slotNode, setSlotNode }}>
      {children}
    </PipelineStagesSlotContext.Provider>
  );
};
