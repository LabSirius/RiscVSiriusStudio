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

**Status:** ready-for-agent

- [ ] A Shell context is driven solely by the Cycle effect (+ initial load); the shared tables and editor highlight consume it.
- [ ] The registers, data-memory and instruction-memory tables no longer read the datapath render payload for their per-clock updates.
- [ ] The Shell holds no reference to `MonocycleWires` / `PipelineStages`.
- [ ] The shared tables/editor are mounted once, not duplicated per CPU model.
- [ ] Both single-cycle and pipeline simulations still run and update correctly (registers, memory, highlight agree with the retiring instruction each clock).
- [ ] The datapath diagram still renders (via the existing path) inside the Shell's slot.
