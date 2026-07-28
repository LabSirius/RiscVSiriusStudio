import { describe, it, expect } from "vitest";
import * as mono from "./dataMonocycleConexions";
import * as pipe from "./dataPipelineConexions";
import { monocycleEnabledEdges, monocycleCurrentType } from "./monocycleEnabledEdges";
import { pipelineEnabledEdges } from "./pipelineEnabledEdges";
import type {
  ParsedInstruction,
  PipelineCycleResult,
  ResultState,
} from "@/context/graphic/CurrentInstContext";

// Seam 2: the pure opcode/signal -> lit-wires kernels. These lock the exact
// per-datapath edge set for each instruction type, opcode, and signal branch,
// so the ticket-05 refactor can move the kernels behind panes without silently
// changing which wires light. Table-driven; expected sets are composed from the
// same conexion registry the app draws from — the kernel's job is choosing the
// right conexions, and that choice is what these assert.

const setOf = (...paths: string[][]) => new Set(paths.flat());

// --- Monocycle ------------------------------------------------------------

const inst = (type: string, opcode = ""): ParsedInstruction =>
  ({ type, opcode } as ParsedInstruction);

// Only `buMux.signal` is read by the monocycle kernel.
const result = (signal: string): ResultState =>
  ({ buMux: { signal } } as unknown as ResultState);

const monoCases: ReadonlyArray<{
  name: string;
  instruction: ParsedInstruction | null;
  result: ResultState;
  expected: Set<string>;
}> = [
  {
    name: "R",
    instruction: inst("R"),
    result: result("X"),
    expected: setOf(
      mono.adder4_muxD, mono.bu_muxD, mono.muxD_pc, mono.pc_adder4, mono.four_adder4,
      mono.pc_im, mono.im_opcode, mono.im_funct3, mono.im_funct7, mono.im_rs1, mono.im_rs2,
      mono.im_rd, mono.muxC_rd, mono.RUWr_wb, mono.rs1_muxA, mono.aluASrc_muxA, mono.rs2_muxB,
      mono.aluBSrc_muxB, mono.muxA_aluA, mono.muxB_aluB, mono.aluOp_alu, mono.brOp_bu,
      mono.alu_muxC, mono.ruDataWrSrc_muxC
    ),
  },
  {
    name: "I (addi 0010011)",
    instruction: inst("I", "0010011"),
    result: result("X"),
    expected: setOf(
      mono.adder4_muxD, mono.bu_muxD, mono.muxD_pc, mono.pc_adder4, mono.four_adder4, mono.pc_im,
      mono.im_opcode, mono.im_funct3, mono.im_rs1, mono.im_rd, mono.muxC_rd, mono.RUWr_wb,
      mono.im_immGen, mono.immSrc_immGen, mono.rs1_muxA, mono.aluASrc_muxA, mono.immGen_muxB,
      mono.aluBSrc_muxB, mono.muxA_aluA, mono.muxB_aluB, mono.aluOp_alu, mono.brOp_bu,
      mono.alu_muxC, mono.ruDataWrSrc_muxC
    ),
  },
  {
    name: "L (load I 0000011)",
    instruction: inst("I", "0000011"),
    result: result("X"),
    expected: setOf(
      mono.adder4_muxD, mono.bu_muxD, mono.muxD_pc, mono.pc_adder4, mono.four_adder4, mono.pc_im,
      mono.im_opcode, mono.im_funct3, mono.im_rs1, mono.im_rd, mono.muxC_rd, mono.RUWr_wb,
      mono.im_immGen, mono.immSrc_immGen, mono.rs1_muxA, mono.aluASrc_muxA, mono.immGen_muxB,
      mono.aluBSrc_muxB, mono.muxA_aluA, mono.muxB_aluB, mono.aluOp_alu, mono.brOp_bu,
      mono.alu_dm, mono.dmWr_dm, mono.dmCtrl_dm, mono.dm_muxC, mono.ruDataWrSrc_muxC
    ),
  },
  {
    name: "JALR (I 1100111)",
    instruction: inst("I", "1100111"),
    result: result("X"),
    expected: setOf(
      mono.alu_muxD, mono.bu_muxD, mono.muxD_pc, mono.pc_adder4, mono.four_adder4, mono.pc_im,
      mono.im_opcode, mono.im_funct3, mono.im_rs1, mono.im_rd, mono.muxC_rd, mono.RUWr_wb,
      mono.im_immGen, mono.immSrc_immGen, mono.rs1_muxA, mono.aluASrc_muxA, mono.immGen_muxB,
      mono.aluBSrc_muxB, mono.muxA_aluA, mono.muxB_aluB, mono.aluOp_alu, mono.brOp_bu,
      mono.adder4_muxC, mono.ruDataWrSrc_muxC
    ),
  },
  {
    name: "S",
    instruction: inst("S"),
    result: result("X"),
    expected: setOf(
      mono.adder4_muxD, mono.bu_muxD, mono.muxD_pc, mono.pc_adder4, mono.four_adder4, mono.pc_im,
      mono.im_opcode, mono.im_funct3, mono.im_rs1, mono.im_rs2, mono.im_immGen, mono.immSrc_immGen,
      mono.rs1_muxA, mono.aluASrc_muxA, mono.immGen_muxB, mono.aluBSrc_muxB, mono.muxA_aluA,
      mono.muxB_aluB, mono.aluOp_alu, mono.brOp_bu, mono.alu_dm, mono.rs2_dm, mono.dmWr_dm,
      mono.dmCtrl_dm
    ),
  },
  {
    name: "B taken (buMux.signal === '1' -> alu_muxD)",
    instruction: inst("B"),
    result: result("1"),
    expected: setOf(
      mono.bu_muxD, mono.muxD_pc, mono.pc_adder4, mono.four_adder4, mono.pc_im, mono.im_opcode,
      mono.im_funct3, mono.im_rs1, mono.im_rs2, mono.im_immGen, mono.immSrc_immGen, mono.pc_muxA,
      mono.aluASrc_muxA, mono.immGen_muxB, mono.aluBSrc_muxB, mono.muxA_aluA, mono.muxB_aluB,
      mono.aluOp_alu, mono.rs1_bu, mono.rs2_bu, mono.brOp_bu, mono.alu_muxD
    ),
  },
  {
    name: "B not taken (buMux.signal !== '1' -> adder4_muxD)",
    instruction: inst("B"),
    result: result("0"),
    expected: setOf(
      mono.bu_muxD, mono.muxD_pc, mono.pc_adder4, mono.four_adder4, mono.pc_im, mono.im_opcode,
      mono.im_funct3, mono.im_rs1, mono.im_rs2, mono.im_immGen, mono.immSrc_immGen, mono.pc_muxA,
      mono.aluASrc_muxA, mono.immGen_muxB, mono.aluBSrc_muxB, mono.muxA_aluA, mono.muxB_aluB,
      mono.aluOp_alu, mono.rs1_bu, mono.rs2_bu, mono.brOp_bu, mono.adder4_muxD
    ),
  },
  {
    name: "J (jal)",
    instruction: inst("J"),
    result: result("X"),
    expected: setOf(
      mono.alu_muxD, mono.bu_muxD, mono.muxD_pc, mono.pc_adder4, mono.four_adder4, mono.pc_im,
      mono.im_opcode, mono.im_rd, mono.muxC_rd, mono.RUWr_wb, mono.im_immGen, mono.immSrc_immGen,
      mono.pc_muxA, mono.aluASrc_muxA, mono.immGen_muxB, mono.aluBSrc_muxB, mono.muxA_aluA,
      mono.muxB_aluB, mono.aluOp_alu, mono.brOp_bu, mono.adder4_muxC, mono.ruDataWrSrc_muxC
    ),
  },
  {
    name: "LUI (U 0110111)",
    instruction: inst("U", "0110111"),
    result: result("X"),
    expected: setOf(
      mono.adder4_muxD, mono.bu_muxD, mono.muxD_pc, mono.pc_adder4, mono.four_adder4, mono.pc_im,
      mono.im_opcode, mono.im_rd, mono.muxC_rd, mono.RUWr_wb, mono.im_immGen, mono.immSrc_immGen,
      mono.immGen_muxB, mono.aluBSrc_muxB, mono.muxB_aluB, mono.aluOp_alu, mono.brOp_bu,
      mono.alu_muxC, mono.ruDataWrSrc_muxC
    ),
  },
  {
    name: "AUIPC (U 0010111)",
    instruction: inst("U", "0010111"),
    result: result("X"),
    expected: setOf(
      mono.adder4_muxD, mono.bu_muxD, mono.muxD_pc, mono.pc_adder4, mono.four_adder4, mono.pc_im,
      mono.im_opcode, mono.im_rd, mono.muxC_rd, mono.RUWr_wb, mono.im_immGen, mono.immSrc_immGen,
      mono.pc_muxA, mono.aluASrc_muxA, mono.immGen_muxB, mono.aluBSrc_muxB, mono.muxB_aluB,
      mono.aluOp_alu, mono.brOp_bu, mono.alu_muxC, mono.ruDataWrSrc_muxC
    ),
  },
  {
    name: "no instruction -> empty",
    instruction: null,
    result: result("X"),
    expected: new Set<string>(),
  },
  {
    name: "unknown opcode in I -> empty",
    instruction: inst("I", "1111111"),
    result: result("X"),
    expected: new Set<string>(),
  },
];

describe("monocycleEnabledEdges", () => {
  it.each(monoCases)("$name", ({ instruction, result, expected }) => {
    expect(monocycleEnabledEdges(instruction, result)).toEqual(expected);
  });
});

describe("monocycleCurrentType", () => {
  const cases: ReadonlyArray<[ParsedInstruction | null, string | null]> = [
    [inst("R"), "R"],
    [inst("I", "0010011"), "I"],
    [inst("I", "0000011"), "L"],
    [inst("I", "1100111"), "JALR"],
    [inst("I", "1111111"), null], // unknown opcode -> label unchanged
    [inst("S"), "S"],
    [inst("B"), "B"],
    [inst("J"), "J"],
    [inst("U", "0110111"), "LUI"],
    [inst("U", "0010111"), "AUIPC"],
    [inst("U", "1111111"), null],
    [null, null],
  ];
  it.each(cases)("%o -> %s", (instruction, label) => {
    expect(monocycleCurrentType(instruction)).toBe(label);
  });
});

// --- Pipeline -------------------------------------------------------------

type StageTuple = [type?: string, opcode?: string];

const stage = (t?: StageTuple) => ({ instruction: { type: t?.[0], opcode: t?.[1] } });

const makeStages = (o: {
  IF?: StageTuple;
  ID?: StageTuple;
  EX?: StageTuple;
  MEM?: StageTuple;
  WB?: StageTuple;
  branch?: string;
}): PipelineCycleResult =>
  ({
    IF: stage(o.IF),
    ID: stage(o.ID),
    EX: { ...stage(o.EX), BranchResult: o.branch ?? "0" },
    MEM: stage(o.MEM),
    WB: stage(o.WB),
  } as unknown as PipelineCycleResult);

// When any stage is active the kernel always lights bu_muxD plus the muxD feed
// chosen by BranchResult. These are the per-clock constants each case builds on.
const pipeBase = (taken = false) => (taken ? [pipe.bu_muxD, pipe.alu_muxD] : [pipe.bu_muxD, pipe.adder4_muxD]);

const pipeCases: ReadonlyArray<{ name: string; stages: PipelineCycleResult; expected: Set<string> }> = [
  {
    name: "all NOP -> empty",
    stages: makeStages({}),
    expected: new Set<string>(),
  },
  {
    name: "IF=J lights fetch chain + jump feeds",
    stages: makeStages({ IF: ["J"] }),
    expected: setOf(
      ...pipeBase(),
      pipe.muxD_pc, pipe.pc_adder4, pipe.four_adder4, pipe.pc_im, pipe.im_instID,
      pipe.adder4_pcIncID, pipe.pc_pc_ID
    ),
  },
  {
    name: "ID=R lights decode chain",
    stages: makeStages({ ID: ["R"] }),
    expected: setOf(
      ...pipeBase(),
      pipe._id, pipe.im_rs1, pipe.im_rs2, pipe.im_opcode, pipe.im_funct3, pipe.im_funct7,
      pipe.ru_rurs1_IE, pipe.ru_rurs2_IE, pipe.im_rd
    ),
  },
  {
    name: "ID=I JALR adds pcIncID_pcIncIE",
    stages: makeStages({ ID: ["I", "1100111"] }),
    expected: setOf(
      ...pipeBase(),
      pipe._id, pipe.im_rs1, pipe.im_immGen, pipe.immSrc_immGen, pipe.im_opcode, pipe.im_funct3,
      pipe.ru_rurs1_IE, pipe.immGen_immExit_IE, pipe.im_rd, pipe.pcIncID_pcIncIE
    ),
  },
  {
    name: "EX=I JALR routes pcIncIE_pcIncMem (not alu_aluresMem)",
    stages: makeStages({ EX: ["I", "1100111"] }),
    expected: setOf(
      ...pipeBase(),
      pipe.aluOp_alu, pipe.brop_bu, pipe._ie, pipe.cuIE_cuMEM1, pipe.cuIE_cuMEM2,
      pipe.aluASrc_muxA, pipe.rs1_muxA, pipe.muxA_aluA, pipe.muxB_aluB, pipe.aluBSrc_muxB,
      pipe.immGen_muxB, pipe.rdIE_rdMEM, pipe.pcIncIE_pcIncMem
    ),
  },
  {
    name: "EX active with BranchResult '1' feeds alu_muxD",
    stages: makeStages({ EX: ["R"], branch: "1" }),
    expected: setOf(
      ...pipeBase(true),
      pipe.aluOp_alu, pipe.brop_bu, pipe._ie, pipe.cuIE_cuMEM1, pipe.cuIE_cuMEM2,
      pipe.aluASrc_muxA, pipe.rs1_muxA, pipe.muxA_aluA, pipe.muxB_aluB, pipe.aluBSrc_muxB,
      pipe.rs2_muxB, pipe.rdIE_rdMEM, pipe.alu_aluresMem
    ),
  },
  {
    name: "MEM=I load (0000011) lights data-memory read path",
    stages: makeStages({ MEM: ["I", "0000011"] }),
    expected: setOf(
      ...pipeBase(),
      pipe._mem, pipe.cuMEM_cuWB, pipe.rdMEM_rdWB,
      pipe.aluResMEM_dm, pipe.dmWr_dm, pipe.dm_dmDataRdWB, pipe.dmCtrl_dm
    ),
  },
  {
    name: "WB=I load (0000011) routes dmDataRdWB_muxC",
    stages: makeStages({ WB: ["I", "0000011"] }),
    expected: setOf(
      ...pipeBase(),
      pipe._wb, pipe.rdWB_ru, pipe.ruDataWrSrc_muxC, pipe.muxC_rd, pipe.ruWr_ru,
      pipe.dmDataRdWB_muxC
    ),
  },
  {
    name: "WB=R writes back alu result",
    stages: makeStages({ WB: ["R"] }),
    expected: setOf(
      ...pipeBase(),
      pipe._wb, pipe.aluResWB_muxC, pipe.rdWB_ru, pipe.ruDataWrSrc_muxC, pipe.muxC_rd, pipe.ruWr_ru
    ),
  },
];

describe("pipelineEnabledEdges", () => {
  it.each(pipeCases)("$name", ({ stages, expected }) => {
    expect(pipelineEnabledEdges(stages)).toEqual(expected);
  });
});
