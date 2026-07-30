# The client mirrors the ICPU/Datapath-view split: Shell over Cycle effect, DatapathPane per CPU

ADR-0003 drew a line in the engine: the **ICPU** contract carries CPU-independent
stepping (the **Cycle effect**), and the **Datapath view** (`MonocycleWires` /
`PipelineStages`) is a per-microarchitecture render concern reached through a
concrete CPU reference — never a `kind`-discriminated union on the shared
contract. This ADR draws the **same line on the React client**.

Today the webview violates it. One React application serves both CPUs: a single
`CurrentInstContext` holds monocycle *and* pipeline shapes, one
`useMessageListener` handles both, and the monocycle-vs-pipeline branch is a
**duck-typed key probe** (`if (message.result.IF)`). The client re-declares the
engine's render types as **divergent hand-mirrors** (`ResultState`,
`PipelineCycleResult`) that drop fields the host actually sends (`add4`,
`MuxResult.result`). This is the pipeline having been bolted onto the
single-cycle view as a prototype and never separated.

## The line

- **Shell — one copy, CPU-independent.** Renders everything that reacts only to
  *what committed this clock*: the registers table, the data-memory table, the
  (static, read-only) instruction-memory table, the editor and its highlight, the
  side panels, and the run/step/reset controls. Its sole per-clock input is the
  **Cycle effect** (`registerWrite`, `memoryAccess`, `retiredInstruction`,
  `controlTransfer`) plus the initial program/memory load. It holds **no**
  datapath render data and never references `MonocycleWires` / `PipelineStages`.

- **DatapathPane — the seam.** A slot the Shell renders, blind to which CPU fills
  it. Behind it sit two adapters — `MonocycleDatapathPane` (reads
  `MonocycleWires`) and `PipelineDatapathPane` (reads `PipelineStages`, and owns
  the pipeline-stages table). Each pane owns its own connection controller and
  datapath elements; genuinely shared machinery (the enabled-vs-all edge diff, the
  `EdgeId` registry, wire-animation primitives) is **extracted into a shared
  datapath-primitives module both panes import — not forked**.

- **Selection happens once, at mount.** The host declares which CPU is running;
  the webview mounts the matching pane. From that point each pane is statically
  typed to its CPU, so a pane's step input only accepts its own view shape.

## Why this line

The engine already earned the split: the ICPU deepening produced the **Cycle
effect**, a CPU-independent per-clock observation. That is exactly the contract
the Shell needs — the registers/data-memory tables change only on a clock and
carry no pipeline-specific detail (no forwarding highlight, no stage tag), so they
are driven entirely by the effect. The Shell can therefore exist **once**, not
duplicated per CPU.

What differs between the two views is irreducibly the **datapath drawing** — a
single-cycle combinational wire diagram versus a five-stage latch diagram. Those
are two different pictures; they cannot be de-duplicated, so they are the only
part with two implementations. This is the minimum-duplication cut: neither two
whole React applications (which would duplicate the Shell), nor one tangled app
(which multiplexes two datapaths through one context and duck-types between them).

Drawing selection **once at mount** rather than per message is what makes the
`.IF` sniff and the divergent-mirror types *structurally impossible* rather than
merely discouraged: the monocycle pane's input is typed `MonocycleWires`, so there
is nothing to discriminate at step time.

## Consequences

- The client's message contract splits along the same seam: Shell-bound data is
  **Cycle-effect-shaped and CPU-independent**; datapath data is per-CPU and
  reaches only the mounted pane. The typed protocol module (see the deepening
  candidate) expresses this without a `kind`-discriminated `step`.
- `CurrentInstContext` splits: a Shell context over the Cycle effect, and a
  per-pane datapath context. The client stops re-declaring `MonocycleWires` /
  `PipelineStages`; it imports them (or their serialized form) from the one
  protocol module.
- The `from` source guard is dropped: the webview receives messages only from the
  extension, so the guard defends a threat that does not exist (a hypothetical
  seam). Shape validation at the boundary subsumes its job.
- A third microarchitecture adds a third `DatapathPane` adapter and its own
  diagram **without touching the Shell** — the same YAGNI posture as ADR-0003 and
  ADR-0001.
- This does not re-litigate ADR-0003; it extends its principle across the
  postMessage boundary. The Shell is the client peer of the text simulator (both
  consume only the Cycle effect and architectural state); the DatapathPane is the
  client peer of the concrete CPU's `datapathView()`.

## Note (2026-07-30): `ShellContext` removed with the Monaco source panel

The Shell's editor highlight (ADR-0004, the `retiredInstruction` line) was owned
by `ShellContext` (`highlightedLine` / `setHighlightedLine`), its sole field.
Removing the Monaco source panel (remove-source-panel ticket 01) left that signal
inert — written each `uploadMemory`/`step` by `useMessageListener`, read by no
one. Ticket 02 deletes `ShellContext` / `ShellProvider` / `useShell` and the
`setHighlightedLine` writes; the host may still post `lineDecorationNumber`, the
webview no longer consumes it. The program-memory `clickAddressInMemoryTable`
signal (also source-panel-only) is dropped from `LinesContext` alongside it; the
`clickInInstruction` host message and the jump-arrow animation are untouched. The
Shell (registers/data-memory/instruction-memory tables, driven by the Cycle
effect) stands as this ADR describes — it simply no longer carries an editor
highlight.
