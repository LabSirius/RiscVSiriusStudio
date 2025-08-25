import { createContext, useContext, useState, ReactNode } from "react";

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
  ImmSRC?: undefined;
  ALUInputA?: undefined;
  ALUInputB?: undefined;
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
  ImmSRC?: string;
}

type Instruction = ParsedInstruction | NOPInstruction;

interface ResultState {
  alu: { a: string; b: string; operation: string; result: string };
  alua: { signal: string };
  alub: { signal: string };
  ru: { rs1: string; rs2: string; dataWrite: string; writeSignal: string };
  imm: { output: string; signal: string };
  bu: { a: string; b: string; operation: string; result: string };
  dm: {
    address: string;
    dataRd: string;
    dataWr: string;
    controlSignal: string;
    writeSignal: string;
  };
  buMux: { result: string; signal: string };
  wb: { signal: string };
}

const NOP_INSTRUCTION_OBJECT: NOPInstruction = { asm: "NOP", pc: -1 };

const NOP_DATA = {
  instruction: NOP_INSTRUCTION_OBJECT,
  PC: -1,
  PCP4: 0,
  RUWr: false,
  ALUASrc: false,
  ALUBSrc: false,
  DMWr: false,
  RUDataWrSrc: "XX",
  ALUOp: "XXXXX",
  BrOp: "XXXXX",
  DMCtrl: "XXX",
  RUrs1: "X".padStart(32, "X"),
  RUrs2: "X".padStart(32, "X"),
  ImmExt: "X".padStart(32, "X"),
  RD: "X",
  rs1: "X",
  rs2: "X",
  ALURes: "X".padStart(32, "X"),
  MemReadData: "X".padStart(32, "X"),
  dataToWrite: "X".padStart(32, "X"),
  ImmSRC: "X",
  ALUInputA: "X".padStart(32, "X"),
  ALUInputB: "X".padStart(32, "X"),
};

interface IDEX_Register {
  instruction: Instruction;
  PC: number;
  PCP4: number;
  RUWr: boolean;
  ALUASrc: boolean;
  ALUBSrc: boolean;
  DMWr: boolean;
  RUDataWrSrc: string;
  DMCtrl: string;
  ALUOp: string;
  BrOp: string;
  RUrs1: string;
  RUrs2: string;
  ImmExt: string;
  ImmSRC: string;
  RD: string;
  rs1: string;
  rs2: string;
}

interface EXMEM_Register {
  instruction: Instruction;
  PC: number;
  PCP4: number;
  RUWr: boolean;
  DMWr: boolean;
  RUDataWrSrc: string;
  DMCtrl: string;
  ALURes: string;
  RUrs2: string;
  RD: string;
  ALUInputA: string;
  ALUInputB: string;
  ALUASrc: boolean;
  ALUBSrc: boolean;
  ALUOp: string
}

interface MEMWB_Register {
  instruction: Instruction;
  PC: number;
  PCP4: number;
  RUWr: boolean;
  RUDataWrSrc: string;
  ALURes: string;
  MemReadData: string;
  RD: string;
}

interface WB_Register {
  instruction: Instruction;
  RD: string;
  dataToWrite: string;
  RUWr: boolean;
}

export type PipelineCycleResult = {
  IF: { instruction: Instruction; PC: number; PCP4: number };
  ID: IDEX_Register;
  EX: EXMEM_Register;
  MEM: MEMWB_Register;
  WB: WB_Register;
};

const initialMonocycleInst: ParsedInstruction | null = null;

const initialResultState: ResultState = {
  alu: { a: "", b: "", operation: "", result: "" },
  alua: { signal: "" },
  alub: { signal: "" },
  ru: { rs1: "", rs2: "", dataWrite: "", writeSignal: "" },
  imm: { output: "", signal: "" },
  bu: { a: "", b: "", operation: "", result: "" },
  dm: { address: "", dataRd: "", dataWr: "", controlSignal: "", writeSignal: "" },
  buMux: { result: "", signal: "" },
  wb: { signal: "" },
};

const initialPipelineValues: PipelineCycleResult = {
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
  currentMonocycleResult: ResultState;
  setCurrentMonocycleResult: React.Dispatch<React.SetStateAction<ResultState>>;
  pipelineValuesStages: PipelineCycleResult;
  setPipelineValuesStages: React.Dispatch<React.SetStateAction<PipelineCycleResult>>;
}

const CurrentInstContext = createContext<CurrentInstContextType>({
  currentMonocycletInst: initialMonocycleInst,
  setCurrentMonocycleInst: () => {},
  currentType: "",
  setCurrentType: () => {},
  currentMonocycleResult: initialResultState,
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
    useState<ResultState>(initialResultState);
  const [pipelineValuesStages, setPipelineValuesStages] =
    useState<PipelineCycleResult>(initialPipelineValues);

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
