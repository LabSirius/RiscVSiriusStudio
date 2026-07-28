import { createContext, useContext, useState, ReactNode } from "react";
import type { MonocycleWires, PipelineStages } from "@protocol/datapath-view";

interface NOPInstruction {
  asm: "NOP";
  pc: -1;
  inst?: undefined;
  type?: undefined;
  opcode?: undefined;
  encoding?: undefined;
  rs1?: undefined;
  rs2?: undefined;
  rd?: undefined;
  instruction?: undefined;
  currentPc?: undefined;
  pseudoasm?: undefined;
  HazardMessage?: undefined
}

export interface ParsedInstruction {
  type: string;
  opcode: string;
  asm: string;
  encoding: {
    hexEncoding: string;
    binEncoding: string;
    funct3: string;
    funct7: string;
    rs1?: string;
    rs2?: string;
    rd?: string;
  };
  rs1?: { regname: string; regeq: string; regenc: string };
  rs2?: { regname: string; regeq: string; regenc: string };
  rd?: { regname: string; regeq: string; regenc: string };
  instruction: string;
  currentPc: number;
  pseudoasm?: string;
  pc: number;
  inst: number;
}

// The datapath-view types (`MonocycleWires` / `PipelineStages`) are imported
// from the protocol module (`@protocol/datapath-view`) — the single source of
// truth for the wire shape. The hand-mirrored `ResultState` /
// `PipelineCycleResult` and the per-stage register interfaces they re-declared
// are gone (ticket 06, ADR-0005).

const NOP_INSTRUCTION_OBJECT: NOPInstruction = { asm: "NOP", pc: -1 };

const NOP_DATA = {
  instruction: NOP_INSTRUCTION_OBJECT,
  PC: -1,
  PCP4: 0,
  RUWr: false,
  ALUASrc: false,
  ALUBSrc: false,
  RUDataWrSrc: "XX",
  ALUOp: "XXXXX",
  BrOp: "XXXXX",
  BranchInputRS1: "X".padStart(32, "X"),
  BranchInputRS2: "X".padStart(32, "X"),
  BranchResult: "0",
  RUrs1: "X".padStart(32, "X"),
  RUrs2: "X".padStart(32, "X"),
  ImmExt: "X".padStart(32, "X"),
  RD: "X",
  rs1: "X",
  rs2: "X",
  ALURes: "X".padStart(32, "X"),
  dataToWrite: "X".padStart(32, "X"),
  ImmSRC: "X",
  ALUInputA: "X".padStart(32, "X"),
  ALUInputB: "X".padStart(32, "X"),

  DMWr: false,

  DMCtrl: "XXX",
  Address: "X".padStart(32, "X"),
  MemWriteData: "X".padStart(32, "X"),
  MemReadData: "X".padStart(32, "X"),

  Opcode: "XXXXXXX",
  Funct3: "XXX",
  Funct7: "XXXXXXX",

};

const initialMonocycleInst: ParsedInstruction | null = null;

// Default datapath view for the single-cycle CPU, conforming to the protocol's
// `MonocycleWires`. All wires blank until the first `step`; the mux/wb bundles
// carry the `result` field the drifted client mirror used to omit.
const initialMonocycleWires: MonocycleWires = {
  add4: { result: "" },
  ru: { rs1: "", rs2: "", dataWrite: "", writeSignal: "" },
  imm: { output: "", signal: "" },
  alua: { signal: "", result: "" },
  alub: { signal: "", result: "" },
  alu: { a: "", b: "", operation: "", result: "" },
  bu: { a: "", b: "", operation: "", result: "" },
  dm: { address: "", dataRd: "", dataWr: "", controlSignal: "", writeSignal: "" },
  buMux: { result: "", signal: "" },
  wb: { signal: "", result: "" },
};

const initialPipelineValues: PipelineStages = {
  IF: { instruction: NOP_INSTRUCTION_OBJECT, PC: -1, PCP4: 0 },
  ID: { ...NOP_DATA },
  EX: { ...NOP_DATA },
  MEM: { ...NOP_DATA },
  WB: { ...NOP_DATA },
};

interface CurrentInstContextType {
  currentMonocycletInst: ParsedInstruction | null;
  setCurrentMonocycleInst: React.Dispatch<React.SetStateAction<ParsedInstruction | null>>;
  currentType: string;
  setCurrentType: React.Dispatch<React.SetStateAction<string>>;
  currentMonocycleResult: MonocycleWires;
  setCurrentMonocycleResult: React.Dispatch<React.SetStateAction<MonocycleWires>>;
  pipelineValuesStages: PipelineStages;
  setPipelineValuesStages: React.Dispatch<React.SetStateAction<PipelineStages>>;
}

const CurrentInstContext = createContext<CurrentInstContextType>({
  currentMonocycletInst: initialMonocycleInst,
  setCurrentMonocycleInst: () => {},
  currentType: "",
  setCurrentType: () => {},
  currentMonocycleResult: initialMonocycleWires,
  setCurrentMonocycleResult: () => {},
  pipelineValuesStages: initialPipelineValues,
  setPipelineValuesStages: () => {},
});

export const useCurrentInst = () => useContext(CurrentInstContext);

export const CurrentInstProvider = ({ children }: { children: ReactNode }) => {
  const [currentMonocycletInst, setCurrentMonocycleInst] = useState<ParsedInstruction | null>(
    initialMonocycleInst
  );
  const [currentType, setCurrentType] = useState<string>("");
  const [currentMonocycleResult, setCurrentMonocycleResult] =
    useState<MonocycleWires>(initialMonocycleWires);
  const [pipelineValuesStages, setPipelineValuesStages] =
    useState<PipelineStages>(initialPipelineValues);

  return (
    <CurrentInstContext.Provider
      value={{
        currentMonocycletInst,
        setCurrentMonocycleInst,
        currentType,
        setCurrentType,
        currentMonocycleResult,
        setCurrentMonocycleResult,
        pipelineValuesStages,
        setPipelineValuesStages,
      }}>
      {children}
    </CurrentInstContext.Provider>
  );
};
