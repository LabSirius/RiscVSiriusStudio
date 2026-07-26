# DecodedInstruction is CPU-independent; control signals are per-microarchitecture

The seam between `DecodedInstruction` (`src/vcpu/instruction.ts`) and each CPU's
`ControlUnit` (`src/vcpu/components/decoder.ts`) is drawn on one axis: **ISA fact
vs datapath control**.

- **`DecodedInstruction` owns ISA facts only** — properties true of the RISC-V
  instruction regardless of the hardware that runs it: type, register usage,
  funct fields, `memoryAccess()` (`{bytes, signed}`), `extend()`, and the
  write-back value's *origin* (`writesComputedResult` / `writesLoadedValue` /
  `writesReturnAddress`). It carries **no** datapath knowledge — no `alu_op`
  encoding, no mux selectors, no control-signal strings.

- **`ControlUnit` / `ControlSignals` own datapath control** — `alu_op`,
  `imm_src`, `ru_data_wr_src`, `br_op`: strings that name wires and muxes of one
  specific datapath. This is **one unit per microarchitecture**. The
  single-cycle and pipeline CPUs share one `ControlUnit` today because they
  share a functional datapath (pipeline only adds registers between stages).

## Why this line, and not "absorb every derivation"

`memoryAccess()` and `extend()` live *inside* `DecodedInstruction` even though
they are derivations, while `alu_op = funct7[6]+funct7[1]+funct3` stays *outside*
in the `ControlUnit`. The rule is not "the deep module owns every derivation" —
it is **ISA-independent facts go in, datapath-specific encodings stay out**.
Byte width and sign/zero extension are ISA-defined (`lb` reads one byte and
sign-extends on any CPU); the 5-bit `alu_op` string is one datapath's ALU
control format. Pulling `alu_op` into `DecodedInstruction` would hardwire the
single-cycle datapath's control vocabulary into the shared ISA model and every
future CPU would inherit it.

## Consequences

- A future CPU with a different datapath (e.g. two ALUs) writes its **own**
  `ControlUnit` reading the **same** `DecodedInstruction`. `DecodedInstruction`
  does not change. No per-CPU abstraction of `ControlUnit` is built until a
  second datapath actually exists (YAGNI) — the invariant is the future-proofing,
  not machinery.
- The golden integration net runs the same `DecodedInstruction` through both
  CPUs; that green net is the living proof the module is CPU-independent.
- `ImmediateUnit` reads the raw node's `encoding` directly rather than going
  through `DecodedInstruction`. This is **not** a seam violation: the immediate
  *value* is an ISA fact, so `ImmediateUnit` is on the shared side of the seam —
  it is simply not physically inside the `DecodedInstruction` class.
- Method names on `DecodedInstruction` describe ISA intent (the write-back
  value's origin), not datapath components. The earlier names `storesALU` /
  `storesMemRead` / `storesNextPC` were renamed to `writesComputedResult` /
  `writesLoadedValue` / `writesReturnAddress` so the invariant is enforced by
  the vocabulary — "ALU" is a component, not an ISA concept.
