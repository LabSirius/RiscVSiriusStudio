# Graphic CPU View (mono-cycle) — research notes for the manual chapter

Research notes in English. Manual is Spanish/Quarto; a manual author can lift
each section below directly. Every non-obvious claim cites `path:line` against
the actual source under `client/simulator/src/`. Where the source did not let me
confirm something, it is under **Open questions** instead of guessed.

All paths below are relative to the repo root
`/home/gg/Documents/RiscVSiriusStudio`.

---

## 1. Overview of the subsystem

The Graphic CPU View is the upper block-diagram of the webview simulator: an
interactive datapath drawing of the single-cycle RISC-V CPU rendered with the
ReactFlow / `@xyflow/react` library. It shows the CPU as labelled blocks (PC,
instruction memory, register unit, ALU, control unit, data memory, muxes, etc.)
connected by wires. On each execution step the wires that the current
instruction actually uses light up, the inactive ones are greyed out, and the
numeric values on each block update to the values computed for that
instruction.

Key facts about how it is mounted:

- The whole webview is split into a CPU-independent **Shell** plus a per-CPU
  **datapath pane** passed in as a slot. `AppComponent` picks the pane once at
  mount from `typeSimulator` (`"monocycle"` vs `"pipeline"`): monocycle renders
  `MonocycleDatapathPane`. `client/simulator/src/components/AppComponent.tsx:18-19`.
- The graphic diagram is only shown when the simulator is in graphic mode
  (`modeSimulator === "graphic"`); otherwise only the text panel shows.
  `client/simulator/src/components/shell/Shell.tsx:29-35`.
- `typeSimulator` defaults to `"monocycle"` and `modeSimulator` to `"text"`;
  both are set from the extension. `client/simulator/src/context/shared/SimulatorContext.tsx:38-39`.
- Data reaches the view from the extension over `window.postMessage`. The
  `"step"` message carries `newPc`, the decoded `currentMonocycletInst`, and the
  datapath `result` (typed `MonocycleWires`); the listener pushes these into the
  `CurrentInstContext`. `client/simulator/src/hooks/useMessageListener.ts:108-132`.

The pane is drawn by ReactFlow with a light background `#F7F9FB`, a dotted grid
background, zoom limits `minZoom=0.1 / maxZoom=2`, and an initial zoom of 1.5.
`client/simulator/src/components/graphic/Canva/monocycle/MonocycleDatapathPane.tsx:19,74-93`.

---

## 2. Block-diagram layout: which blocks are shown

**What the user sees.** A left-to-right datapath grouped into five coloured
stage sections, each with a title bar, and the control unit spanning the bottom.
Blocks are rounded rectangles with a title and (after the first step) numeric
value labels; wires connect them with arrowheads and elbow (smooth-step) bends.

The diagram is assembled from ReactFlow "nodes". Nodes come from five stage
groups combined in order IF → ID → IE → MEM → WB.
`client/simulator/src/components/graphic/Canva/shared/nodes/initialNodes.ts:8-22`.

Each stage is a coloured group box with a title bar node. Example: the IF group
box is pink `#FCE4EC` and carries the title node "Fetch (IF)".
`client/simulator/src/components/graphic/Canva/shared/nodes/IF.tsx:13-28`.
The title bar node type is `title`, rendered by `TittleText`, which just prints
`data.label`. `client/simulator/src/components/graphic/elements/TittleText.tsx:9-15`;
node type registration `client/simulator/src/components/graphic/Canva/shared/constants.ts:126`.

Blocks present in the mono-cycle diagram, by stage (from the `nodeTypes`
registry `client/simulator/src/components/graphic/Canva/shared/constants.ts:125-263`
and the IF node placement file):

- **IF (Fetch):** PC, Adder 4, the constant "4", Instruction Memory, MUX D.
  `client/simulator/src/components/graphic/Canva/shared/nodes/IF.tsx:33-45`.
- **ID (Decode):** Registers Unit, Control Unit, Imm Generator, ImmSrc, RUWr
  (register-write-enable control). `constants.ts:136-141`.
- **IE (Execute):** MUX A, ALUASrc, MUX B, ALUBSrc, ALU, ALUOp, Branch Unit,
  BrOp. `constants.ts:144-152`.
- **MEM:** Data Memory, DMWr, DMCtrl. `constants.ts:155-158`.
- **WB (Write-back):** MUX C, RUDataWrSrc. `constants.ts:162-164`.
- Plus many `pivotN` / `pivotJumpN` nodes that are invisible wire-routing
  waypoints (elbows/junctions), not user-visible blocks. `constants.ts:167-221`.

Note: the same node registry also contains `pipeline`-only nodes (stage
separators, inter-stage registers like `pc_fe`, `inst_id`, `cu_ie`, …). Those
are placed only when `typeSimulator === "pipeline"`
(`IF.tsx:71-101`, gated by `isPipeline`), so they do **not** appear in the
mono-cycle view — but the same code file serves both CPUs.

**How each block is drawn.** A block is a React component that renders a title
(`titleInElement`), a rounded "container" SVG frame (`ContainerSVG`), and its
value labels. Example — PC: `client/simulator/src/components/graphic/elements/IF/PC/PC.tsx:10-33`.
The frame `ContainerSVG` draws the rounded border; its colour signals state:
active `#555555`, upload-phase `#AAAAAA` (pulsing), otherwise dimmed `#D3D3D3`.
`client/simulator/src/components/graphic/elements/ContainerSVG.tsx:13-31`.

**The datapath is hand-built, not a loaded SVG asset.** There is no external
`.svg` datapath file loaded at runtime; the diagram is composed from React
node components plus ReactFlow edges. Muxes are drawn as inline `<svg>` polygons
(`MUXContainer` trapezoid). `client/simulator/src/components/graphic/elements/MUXContainer.tsx:20-40`.
(Export to SVG/PNG rasterises this live DOM — see §7.)

**Per-block active/inactive dimming.** Several blocks grey themselves out when
the current instruction does not use them, by comparing `currentType` /
instruction fields. Examples (mono-cycle branch of the ternary):
- Data Memory is active only for load/store: `currentType === "L" || currentType === "S"`.
  `client/simulator/src/components/graphic/elements/MEM/DataMemory/DataMemory.tsx:30,36`.
- Imm Generator dims for R-type (no immediate): feature enabled only when not
  R-type / not NOP / not ebreak. `client/simulator/src/components/graphic/elements/ID/ImmGenerator/ImmGenerator.tsx:31-33,45-51`.
- ALU / Registers Unit dim on `ebreak`. `.../IE/ALU/ALU.tsx:44-48`, `.../ID/RegistersUnit/RegistersUnit.tsx:32,37-48`.

---

## 3. Animated datapath lines / signals (the core "step" behaviour)

**What the user sees on a step.** The wires that the current instruction uses
turn blue and stay solid; every other registered wire goes light grey. Hovering
a wire animates its whole logical path with a moving dash; clicking a wire
"pins" that path in pink.

### 3.1 Which wires light up (blue) vs grey

- On each step the message listener stores the decoded instruction and the
  `MonocycleWires` result into context.
  `client/simulator/src/hooks/useMessageListener.ts:126-131`.
- `MonocycleConexionsController` reads the monocycle "enabled edges" kernel and
  hands the enabled + disabled sets to the shared `ConexionsController`.
  `client/simulator/src/components/graphic/Canva/monocycle/MonocycleConexionsController.tsx:15-18`.
- The kernel `monocycleEnabledEdges` is a pure function: given the current
  instruction's `type`/`opcode` (and, for branches, the branch-mux signal) it
  returns the set of edge ids to light this clock. It has one case per RISC-V
  instruction class: R, I (`0010011` arithmetic-imm / `0000011` load /
  `1100111` JALR), S, B, J (JAL), U (`0110111` LUI / `0010111` AUIPC).
  `client/simulator/src/components/graphic/Canva/shared/conexions-controller/monocycleEnabledEdges.ts:11-277`.
  - Branch (B) picks the taken vs not-taken wire from the datapath result:
    `if (result.buMux.signal === "1") add(alu_muxD) else add(adder4_muxD)`.
    `monocycleEnabledEdges.ts:189-193`.
- Disabled edges = every registered edge not in the enabled set.
  `useDataMonocycleConexions.ts:19-25`; diff helper
  `datapath-primitives.ts:34-40`.
- The renderer restyles edges: disabled → stroke `#D3D3D3` (light grey);
  enabled and not selected → `#3B59B6` (blue); selected → `#E91E63` (pink).
  `client/simulator/src/components/graphic/Canva/shared/conexions-controller/ConexionsController.tsx:47-61`.
- Before the first step / on program upload (`operation === "uploadMemory"`)
  all edges are reset to blue and unselected.
  `ConexionsController.tsx:34-45`.
- The enabled set is also pushed to `ActiveEdgesContext` (used by the export
  buttons to know which wires to thicken). `ConexionsController.tsx:28-32`;
  context `client/simulator/src/context/graphic/ActiveEdgesContext.tsx`.

Important nuance for the manual: **the lit wires are not "flowing" animations by
default.** After a step they are simply recoloured solid blue. The travelling-dot
/ dashed animation only happens on user hover or click (§3.2), or via the
per-stage overlay motion (see Open questions on `OverlayContext`).

### 3.2 Hover and click animation of a wire's whole group

Wires belong to logical "conexion" groups (a whole path that lights together,
e.g. PC → pivots → instruction memory). Hovering/clicking any edge animates the
whole group.

- Edge event handlers are wired on the ReactFlow canvas: `onEdgeClick`,
  `onEdgeMouseEnter`, `onEdgeMouseLeave`.
  `MonocycleDatapathPane.tsx:58-71,84-86`.
- **Hover** (`animateLineHover`): sets `animated: true` on every edge in the
  group and strokes it blue `#3B59B6` (or pink `#E91E63` if it is already
  selected). Disabled edges are skipped. On mouse-leave the same runs with
  `animated: false`. `datapath-primitives.ts:70-88`; skip-disabled guard
  `MonocycleDatapathPane.tsx:64,69`.
- **Click** (`animateLineClick`): toggles a group "selected". Selecting strokes
  the group pink `#E91E63` and marks `data.selected=true`; clicking again
  removes it and returns it to blue. Multiple groups can be pinned at once.
  `datapath-primitives.ts:91-137`.
- The group membership map (`edgeGroups`) is built from the conexion registry;
  monocycle uses `dataMonocycleConexions`. `datapath-primitives.ts:46-67`.
  A large hand-written map of which edges belong to which visual path also
  exists in `client/simulator/src/components/graphic/animateLine/constants.ts:108-245`.

### 3.3 The animated edge visual

The custom edge type `animatedSvg` (registered as the only custom edge type)
draws a smooth-step path plus a pink `#ff0072` dot that travels along the path
once per second (`animateMotion dur="1s" repeatCount="indefinite"`).
`client/simulator/src/components/graphic/custom/AnimatedSVGEdge.tsx:13-34`;
registration `client/simulator/src/components/graphic/Canva/shared/constants.ts:265-267`.

### 3.4 Signal values on wires: `LabelValue` and `LabelSlash`

- **`LabelValue`** renders a small `label` above a `value` — the generic
  "name + number" pill used all over the diagram. `client/simulator/src/components/graphic/LabelValue.tsx:8-15`.
- **`LabelValueWithHover`** wraps `LabelValue` in a hover card that, on hover,
  shows the same value in three bases: decimal `d'…`, binary `b'…`, hex `h'…`.
  `client/simulator/src/components/graphic/elements/LabelValueWithHover.tsx:19-48`.
  This is the tooltip the user gets on almost every numeric field.
- **`LabelSlash`** draws a bus-width tick (an orange "/" from lucide) with the
  bit-count number, e.g. the 32-bit instruction bus out of instruction memory.
  When inactive it renders grey `#D3D3D3` instead of orange.
  `client/simulator/src/components/graphic/LabelSlash.tsx:9-19`;
  used for the 32-bit instruction bus `.../IF/InstructionMemory/InstructionMemory.tsx:22-25`.

Representative per-block values shown (mono-cycle branch of each container):

- **PC block:** "PC" (current PC as `h'…`, computed `currentPc*4`) and "NextPc"
  (`buMux.result`). `client/simulator/src/components/graphic/elements/IF/PC/LabelValueContainer.tsx:14-27,49-69`.
- **Control Unit:** Opcode (`b'…`), Funct3, Funct7 (Funct7 only for R-type,
  Funct3 hidden for LUI/AUIPC/J). `.../ID/ControlUnit/LabelValueContainer.tsx:28-33,48-83`.
- **Imm Generator:** "Imm" (extended immediate `imm.output`) and the ImmSrc
  signal (`imm.signal`), hidden for R-type. `.../ID/ImmGenerator/LabelValueContainer.tsx:22-37,66-87`.
- **ALU:** inputs "A" and "B", "ALURes", the 4/5-bit ALU op code (`b'…`), and a
  large operator glyph derived from the op code (`+ − ⊕ | & << >> < …`,
  including M-extension `* ÷ %`). LUI hides the A input.
  `.../IE/ALU/LabelValueContainer.tsx:8-47,84-92,119-148`.
- **MUX D (branch/next-PC select):** shows its select signal (`buMux.signal`)
  as `b'…`. `.../IF/MuxD.tsx:27-29,36-48`. The mux trapezoid's internal
  select-line flips up/down with the signal (0 vs 1).
  `MUXContainer.tsx:42-65`.
- **Data Memory:** value labels only when the instruction is a load/store.
  `.../MEM/DataMemory/DataMemory.tsx:30,40`.

Values are formatted with helpers in `client/simulator/src/utils/handlerConversions`
(`binaryToHex`, `binaryToInt`, `unsignedToHex`, `intToHex`), e.g. PC label
container `.../IF/PC/LabelValueContainer.tsx:2,17-20`. Two small formatting
hooks exist (`useFormattedPC`, `useFormattedImm`,
`client/simulator/src/hooks/graphic/useFormattedPC.ts`,
`.../useFormattedImm.ts`) but the block containers above compute their own
formatting inline; see Open questions on where the hooks are actually consumed.

---

## 4. Current-instruction info panel (`CurrentInstructionInfo`)

**What the user sees.** A floating pill group above the Control Unit showing the
instruction currently executing. Fields:

- Optional pseudo-instruction line (`pseudoasm`), shown as its own pill on top
  when present. `client/simulator/src/components/graphic/CurrentInstructionInfo.tsx:32-36`.
- The assembly text `asm`. `CurrentInstructionInfo.tsx:38-40`.
- The instruction `type` (e.g. R, I, S, B, J, U). `CurrentInstructionInfo.tsx:42-44`.

All three pills are teal `#66939E` with white text.
It is hidden during `operation === "uploadMemory"` (before execution starts).
`CurrentInstructionInfo.tsx:29`. It is rendered only in the mono-cycle view,
inside the Control Unit. `client/simulator/src/components/graphic/elements/ID/ControlUnit/ControlUnit.tsx:19`.

**Behaviour on step.** On every `newPc` change it plays an exit→enter transition
(`animate-exit` for 0–300 ms, then `animate-enter` to 600 ms, then cleared) so
the panel visibly "swaps" to the new instruction.
`CurrentInstructionInfo.tsx:10-25`. Data source: `currentMonocycletInst` from
`CurrentInstContext`. `CurrentInstructionInfo.tsx:7`;
shape `ParsedInstruction` `client/simulator/src/context/graphic/CurrentInstContext.tsx:20-41`.

---

## 5. Clock indicator (`ClockTriangle`)

**What the user sees.** A small triangle (lucide `Triangle`, dark grey
`#404040`) centred under a block; it "jumps" briefly each time the PC changes,
signalling a clock edge / new cycle. `client/simulator/src/components/graphic/ClockTriangle.tsx:5-22`.

**Behaviour.** On every `newPc` change it toggles the `pc-change-anim` class for
400 ms. `ClockTriangle.tsx:9-15`. The CSS animation is a short upward
"triangle-jump" (0.25 s ease-out). `client/simulator/src/main.css:368-370`
(keyframes end at `main.css:360-366`). Size is 24 px in mono-cycle (34 px in
pipeline). `ClockTriangle.tsx:19`. It is attached under blocks that carry a clock
edge — e.g. PC and Registers Unit — and lifts on hover with the block.
`.../IF/PC/PC.tsx:20-22`, `.../ID/RegistersUnit/RegistersUnit.tsx:51-53`.

So for the manual: the clock triangle marks state-holding elements (PC, register
file) and pulses once per executed instruction to convey "one clock per cycle".

---

## 6. User interactions: zoom, pan, fit, minimap, controls

**Canvas controls.** A custom control bar (`CustomControls`, bottom-left of the
canvas) offers, from top:

- **Step** (blue, lucide `RedoDot`) — posts `{event:'step'}` to the extension to
  execute one instruction. `client/simulator/src/components/graphic/custom/CustomControls.tsx:42-48`.
- **Stop** (red, `Ban`) — posts `{event:'stop'}`. `CustomControls.tsx:49-55`.
- **Reset** (green, `RotateCcw`) — posts `{event:'reset'}`. `CustomControls.tsx:56-62`.
  (These three hide once a stop dialog is active. `CustomControls.tsx:32-36,40`.)
- **Fit View** (`Fullscreen`) — recentres/fits the diagram; hovering it reveals
  **Zoom In / Zoom Out** buttons. `CustomControls.tsx:66-95`.
- **Copy** (`CopyToClipboardButton`) — hovering it reveals the **SVG** and
  **PNG** export buttons. `CustomControls.tsx:97-108`.

Zoom/fit/pan handlers come from `useProcessorFlow`: fit uses `fitView({padding:0.01})`,
plus zoom-in/out and a minimap toggle. `client/simulator/src/components/graphic/Canva/hooks/useProcessorFlow.ts:30-39,50-56`.
On init the view auto-fits. `useProcessorFlow.ts:36-39`.

**Pan / drag / selection.** Controlled by `isInteractive` (`panOnDrag`,
`elementsSelectable`). `MonocycleDatapathPane.tsx:90-91`. Default interactive
(`useProcessorFlow.ts:23`).

**Fit-view trigger from elsewhere.** A `fitViewTrigger` counter (from
`CustomOptionSimulate`) re-fits the view with a 400 ms animation when it
increments — used to recentre when layout/options change.
`MonocycleDatapathPane.tsx:42,45-54`.

**Minimap.** Off by default; a minimap can be toggled on and, when on, renders a
ReactFlow `MiniMap`. `MonocycleDatapathPane.tsx:94`; state in
`useProcessorFlow.ts:21,34,57`. (No visible button for it is wired in
`CustomControls` — see Open questions.)

**Tooltips / hover.** Every numeric value hover-card shows decimal/binary/hex
(§3.4). The Imm Generator additionally has a hover card with a "PanelTopClose"
button that opens an **immediate-decode** detail panel (`ImmDecode`), closable
with an X. `.../ID/ImmGenerator/ImmGenerator.tsx:40-107`. Blocks also lift and
cast a shadow on hover (`custom-shadow`). `main.css:438-446`; block hover-lift
e.g. `.../IF/PC/PC.tsx:20`.

---

## 7. Export: PNG / SVG download and clipboard copy

Three export actions share one approach: temporarily restyle the active
(lit) edges to a thick solid stroke, turn off edge animation, rasterise the live
`.react-flow__viewport` DOM at 1920 px width with `html-to-image`, then restore
the original edges.

- **PNG** (`DownloadPNGButton`): `toPng`, downloads `execution.png`. Active edges
  drawn stroke `#3B5BB6`, width 4 px; background `#F7F9FB`; the controls bar is
  filtered out of the image. `client/simulator/src/components/graphic/DownloadPNGButton.tsx:7-78`.
  Active-edge set comes from `ActiveEdgesContext`. `DownloadPNGButton.tsx:26,32-36`.
- **SVG** (`DownloadSVGButton`): `toSvg`, downloads `execution.svg`; active edge
  stroke `#3B59B6`, width 4 px, otherwise identical. `client/simulator/src/components/graphic/DownloadSVGButton.tsx:7-83`.
- **Copy to clipboard** (`CopyToClipboardButton`): `toBlob` → PNG blob written to
  the clipboard, with a toast ("Image copied to clipboard!" / "Failed to copy
  image."). `client/simulator/src/components/graphic/Canva/CopyToClipboardButton.tsx:25-77`.

So the export reflects the **current step's** lit datapath (active wires
emphasised), not an animated capture. The scale is computed from the node
bounding box so the whole diagram fits 1920 px wide with 50 px padding.
`DownloadPNGButton.tsx:14-15,55-69`.

Note the small colour inconsistency for the manual/QA: PNG uses `#3B5BB6`, SVG
and clipboard use `#3B59B6`. `DownloadPNGButton.tsx:19` vs
`DownloadSVGButton.tsx:19` / `CopyToClipboardButton.tsx:12`.

---

## 8. Component map

| Component / concern | File (`client/simulator/src/…`) | Role |
|---|---|---|
| Pane selection | `components/AppComponent.tsx` | Picks Monocycle vs Pipeline pane once at mount from `typeSimulator` |
| Shell | `components/shell/Shell.tsx` | CPU-independent layout; renders datapath slot only in graphic mode |
| Monocycle pane | `components/graphic/Canva/monocycle/MonocycleDatapathPane.tsx` | ReactFlow canvas, viewport, edge hover/click handlers |
| Flow state hook | `components/graphic/Canva/hooks/useProcessorFlow.ts` | nodes/edges state, zoom/fit/minimap handlers |
| Node registry | `components/graphic/Canva/shared/constants.ts` | Maps node-type strings → block components; `edgeTypes` |
| Node layout (IF…WB) | `components/graphic/Canva/shared/nodes/{IF.tsx,ID.ts,IE.ts,MEM.ts,WB.ts,initialNodes.ts}` | Positions/sizes of blocks and stage groups |
| Base edges (monocycle) | `components/graphic/Canva/monocycle/edges/baseEdges.ts` | Wire list for the mono-cycle diagram |
| Enabled-edges kernel | `components/graphic/Canva/shared/conexions-controller/monocycleEnabledEdges.ts` | Pure map: instruction → set of lit wires + type label |
| Monocycle conexions hook | `.../conexions-controller/useDataMonocycleConexions.ts` | Runs kernel, computes disabled set, pushes type label |
| Renderer | `.../conexions-controller/ConexionsController.tsx` | Restyles edges lit/dimmed; publishes active edges |
| Monocycle controller | `components/graphic/Canva/monocycle/MonocycleConexionsController.tsx` | Wires the monocycle kernel into the shared renderer |
| Wire animation primitives | `.../conexions-controller/datapath-primitives.ts` | Hover/click group animation, edge-group build |
| Wire-group map | `components/graphic/animateLine/constants.ts` | Hand-written edge→path group membership |
| Animated edge | `components/graphic/custom/AnimatedSVGEdge.tsx` | Smooth-step path + travelling pink dot |
| Canvas controls | `components/graphic/custom/CustomControls.tsx` | Step/Stop/Reset, fit/zoom, export hover menu |
| PNG export | `components/graphic/DownloadPNGButton.tsx` | Rasterise viewport → `execution.png` |
| SVG export | `components/graphic/DownloadSVGButton.tsx` | Rasterise viewport → `execution.svg` |
| Clipboard copy | `components/graphic/Canva/CopyToClipboardButton.tsx` | Copy PNG blob to clipboard + toast |
| Current instruction pill | `components/graphic/CurrentInstructionInfo.tsx` | pseudoasm / asm / type of current instruction |
| Clock indicator | `components/graphic/ClockTriangle.tsx` | Triangle that jumps on each PC change |
| Generic label | `components/graphic/LabelValue.tsx` | label + value pill |
| Label + multi-base tooltip | `components/graphic/elements/LabelValueWithHover.tsx` | Hover shows dec/bin/hex |
| Bus-width slash | `components/graphic/LabelSlash.tsx` | Orange "/" with bit count |
| Block frame | `components/graphic/elements/ContainerSVG.tsx` | Rounded border; colour = active/upload/dimmed |
| Mux trapezoid | `components/graphic/elements/MUXContainer.tsx` | Inline SVG mux with select-line |
| Blocks (examples) | `elements/IF/PC/PC.tsx`, `elements/ID/ControlUnit/ControlUnit.tsx`, `elements/ID/RegistersUnit/RegistersUnit.tsx`, `elements/IE/ALU/ALU.tsx`, `elements/MEM/DataMemory/DataMemory.tsx`, `elements/ID/ImmGenerator/ImmGenerator.tsx` | Individual datapath blocks + their value containers |
| Datapath state | `context/graphic/CurrentInstContext.tsx` | `currentMonocycletInst`, `currentMonocycleResult`, `currentType` |
| Active edges | `context/graphic/ActiveEdgesContext.tsx` | Lit-edge ids for export |
| Overlay state | `context/graphic/OverlayContext.tsx` | Per-stage overlay-active flags (see Open questions) |
| Simulator state | `context/shared/SimulatorContext.tsx` | `typeSimulator`, `modeSimulator`, `newPc`, `operation`, `isEbreak`, … |
| Message intake | `hooks/useMessageListener.ts` | Receives `step`/`uploadMemory`/… from extension, fills contexts |

---

## 9. Open questions / needs screenshot verification

1. **Default "flow" of lit wires.** From source, a step recolours enabled wires
   solid blue (`ConexionsController.tsx:47-61`); the travelling-dot/dash
   animation is only triggered on hover/click. Confirm on screen whether steps
   ever auto-animate flow (e.g. via the overlay motion classes
   `overlay-moveX/-moveY`, `main.css:391-421`).
2. **`OverlayContext` usage.** `context/graphic/OverlayContext.tsx` defines
   per-stage overlay-active flags but I did not trace where they are set/read in
   the mono-cycle view. Where do the `overlay-moveX/-moveY` animations appear on
   the diagram, and are they part of a step? Needs a consumer trace + screenshot.
3. **Minimap toggle button.** `useProcessorFlow` supports a minimap toggle
   (`useProcessorFlow.ts:34,57`) but `CustomControls` does not appear to render a
   button that calls `onToggleMinimap`. Verify whether the minimap is reachable
   from the UI in the mono-cycle view.
4. **`useFormattedPC` / `useFormattedImm`.** These hooks exist
   (`hooks/graphic/useFormattedPC.ts`, `useFormattedImm.ts`) but the block value
   containers compute formatting inline. Confirm whether these hooks are actually
   used anywhere in the mono-cycle view or are dead/legacy.
5. **ImmDecode detail panel.** The Imm Generator opens an `ImmDecode` panel
   (per-type immediate bit decomposition, `TypeI/S/B/U/J`). I confirmed the
   trigger (`ImmGenerator.tsx:85-105`) but did not read `ImmDecode.tsx` contents;
   a screenshot + a read of `elements/ID/ImmGenerator/immDecode/*` is needed to
   describe exactly what fields it shows.
6. **Control Unit output "tunnels".** `ControlUnit` renders `<Tunels />`
   (`ControlUnit.tsx:31`) which visually route control signals (Decode/Execute/
   Memory/WB tunnels). I did not open the tunnel components; verify what control
   signals they surface to the user (e.g. RUWr, ALUSrc, DMWr…).
7. **Export colour mismatch.** PNG active-edge stroke `#3B5BB6` vs SVG/clipboard
   `#3B59B6` — likely a typo. Worth a visual check that PNG active wires match
   the on-screen blue.
8. **`console.log` left in ALU.** `elements/IE/ALU/ALU.tsx:19` logs
   `pipelineValuesStages` every render — not user-facing but noted.
