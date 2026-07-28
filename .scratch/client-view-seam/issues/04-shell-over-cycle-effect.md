# 04 — Shell over Cycle effect

**What to build:** the CPU-independent parts of the UI become a single **Shell**
driven by the **Cycle effect**, not by the datapath render payload. A developer sees
the registers table, the data-memory table, the read-only instruction-memory table
and the editor highlight all update from the effect that the engine already emits
each clock — mounted once, identical for both CPU models. The datapath diagram is
still drawn by the current path, now living inside a slot the Shell renders.

Design (ADR-0005): introduce a Shell context over `CycleEffect` (register write,
memory access, retired instruction, control transfer) plus the initial
program/memory load. Switch the shared tables and the editor highlight off the
datapath `result` and onto this context. The Shell references no datapath-view type.
The datapath render is wrapped in the Shell's slot but not yet split into per-CPU
adapters (that is ticket 05).

**Blocked by:** 02.

**Status:** done

- [x] A Shell context is driven solely by the Cycle effect (+ initial load); the shared tables and editor highlight consume it.
- [x] The registers, data-memory and instruction-memory tables no longer read the datapath render payload for their per-clock updates.
- [x] The Shell holds no reference to `MonocycleWires` / `PipelineStages`.
- [x] The shared tables/editor are mounted once, not duplicated per CPU model.
- [x] Both single-cycle and pipeline simulations still run and update correctly (registers, memory, highlight agree with the retiring instruction each clock).
- [x] The datapath diagram still renders (via the existing path) inside the Shell's slot.

## Implementation notes

- **`ShellContext`** (`client/.../context/shell/ShellContext.tsx`) — the client peer
  of the engine `CycleEffect`. Owns the editor highlight (`highlightedLine`), the
  retiring-instruction line the Shell renders. Holds no datapath-view type.
- **Editor highlight moved** off `LinesContext.lineDecorationNumber` onto the Shell
  context; `ProgramSection` consumes `useShell()`. `LinesContext` keeps only the
  user-click signals.
- **`useMessageListener` `step` case de-gated**: the Cycle-effect signals (editor
  highlight, committed `newPc`) are now set uniformly for both CPUs, *outside* the
  `message.result.IF` probe. The probe remains only to route the per-CPU datapath
  `result` into the pane slot — the last remnant, removed in ticket 05.
- **`Shell` component** (`components/shell/Shell.tsx`) renders the shared chrome and
  a `datapath` slot; `AppComponent` selects the pane once at mount and passes it in.
- **Producer unified** (`src/Simulator.ts`): the `PipelineGraphicSimulator`
  `postStepUpdate` override that stripped `newPc`/`lineDecorationNumber`/retired
  instruction was removed. Both CPUs now post the Cycle-effect fields from the base
  path (only `result` differs), so the pipeline editor highlight and memory-table
  PC-follow work each clock. Host/seam change only; `src/vcpu/` untouched.
- Verified: extension esbuild, client `tsc -b` (landmine stays disarmed), 68 client
  Vitest cases, and `vite build` all green.
