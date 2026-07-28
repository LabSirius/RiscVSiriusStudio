import React, { createContext, useContext, useState, ReactNode } from "react";

/**
 * The Shell context: the client peer of the engine's Cycle effect (ADR-0005).
 *
 * The Shell is the CPU-independent layer of the webview — the registers,
 * data-memory and instruction-memory tables, the editor and its highlight. Its
 * only per-clock input is the Cycle effect the engine already emits each clock
 * (register write, memory access, retired instruction, control transfer), which
 * the extension projects onto discrete messages. This context owns the slice of
 * that effect the Shell renders directly and that is *not* already carried by a
 * dedicated shared context:
 *
 *  - `highlightedLine` — the source line of the instruction that retired this
 *    clock (the Cycle effect's `retiredInstruction`, ADR-0004). `-1` means
 *    nothing retired (a pipeline fill/bubble) and nothing is highlighted.
 *
 * The register write and memory access projections reach their tables through
 * the existing `RegistersTableContext` / `MemoryTableContext` (fed by the
 * `setRegister` / `readMemory` / `writeMemory` messages), and the committed PC
 * through `SimulatorContext.newPc`; all are CPU-independent and mounted once.
 * The message listener now drives every one of them uniformly for both CPUs,
 * off the Cycle effect rather than off the datapath render payload — so the
 * monocycle-vs-pipeline `.IF` probe no longer gates any Shell state.
 *
 * This context holds **no** datapath-view data: it never references
 * `MonocycleWires` / `PipelineStages`. The per-CPU datapath render payload lives
 * in `CurrentInstContext`, consumed only by the mounted DatapathPane.
 */
interface ShellContextProps {
  /** Source line to highlight for the instruction that retired this clock; `-1` = none. */
  highlightedLine: number;
  setHighlightedLine: React.Dispatch<React.SetStateAction<number>>;
}

const ShellContext = createContext<ShellContextProps | undefined>(undefined);

export const ShellProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [highlightedLine, setHighlightedLine] = useState<number>(-1);

  return (
    <ShellContext.Provider value={{ highlightedLine, setHighlightedLine }}>
      {children}
    </ShellContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useShell = (): ShellContextProps => {
  const context = useContext(ShellContext);
  if (!context) {
    throw new Error("useShell must be used within a ShellProvider");
  }
  return context;
};
