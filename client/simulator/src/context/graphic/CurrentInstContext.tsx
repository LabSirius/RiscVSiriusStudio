import { createContext, useContext, useState, ReactNode } from "react";



interface CurrentInstState {
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
  rs1?: {
    regenc: string;
  };
  rs2?: {
    regenc: string;
  };
  instruction: string;
  currentPc: number;
  pseudoasm?: string;
}

interface ResultState {
  alu: { a: string; b: string; operation: string; result: string };
  alua: { signal: string };
  alub: { signal: string };
  ru: { rs1: string; rs2: string; dataWrite: string; writeSignal: string };
  imm: { output: string; signal: string };
  bu: { a: string; b: string; operation: string; result: string };
  dm: { address: string; dataRd: string; dataWr: string; controlSignal: string; writeSignal: string };
  buMux: { result: string; signal: string };
  wb: { signal: string };
}

const NOP_DATA = {
  instruction: { 
    asm: "NOP", pc: -1, encoding: undefined,
    rd: undefined, rs1: undefined, rs2: undefined,
  } as unknown,
  PC: -1, PCP4: 0, RUWr: false, ALUASrc: false, ALUBSrc: false, DMWr: false,
  RUDataWrSrc: "XX", ALUOp: "XXXXX", BrOp: "XXXXX", DMCtrl: "XXX",
  RUrs1: "X".padStart(32, "X"), RUrs2: "X".padStart(32, "X"),
  ImmExt: "X".padStart(32, "X"), RD: "X", rs1: "X", rs2: "X",
  ALURes: "X".padStart(32, "X"), MemReadData: "X".padStart(32, "X"),
};

interface IDEX_Register {
  instruction: unknown;
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
  RD: string;
  rs1: string;
  rs2: string;
}

interface EXMEM_Register {
  instruction: unknown;
  PC: number;
  PCP4: number;
  RUWr: boolean;
  DMWr: boolean;
  RUDataWrSrc: string;
  DMCtrl: string;
  ALURes: string;
  RUrs2: string;
  RD: string;
}

interface MEMWB_Register {
  instruction: unknown;
  PC: number;
  PCP4: number;
  RUWr: boolean;
  RUDataWrSrc: string;
  ALURes: string;
  MemReadData: string;
  RD: string;
}

export type PipelineCycleResult = {
  IF: { instruction: unknown; PC: number; PCP4: number };
  ID: IDEX_Register;
  EX: EXMEM_Register;
  MEM: MEMWB_Register;
  WB: MEMWB_Register;
};



const initialCurrentInstState: CurrentInstState = {
  type: "", opcode: "", asm: "",
  encoding: { hexEncoding: "", binEncoding: "", funct3: "", funct7: "", rs1: "", rs2: "", rd: "" },
  rs1: { regenc: "" }, rs2: { regenc: "" },
  instruction: "", currentPc: 0, pseudoasm: ""
};

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
  IF: { instruction: NOP_DATA.instruction, PC: -1, PCP4: 0 },
  ID: { ...NOP_DATA },
  EX: { ...NOP_DATA },
  MEM: { ...NOP_DATA },
  WB: { ...NOP_DATA },
};



interface CurrentInstContextType {
  currentMonocycletInst: CurrentInstState;
  setCurrentMonocycleInst: React.Dispatch<React.SetStateAction<CurrentInstState>>;
  currentType: string;
  setCurrentType: React.Dispatch<React.SetStateAction<string>>;
  currentMonocycleResult: ResultState;
  setCurrentMonocycleResult: React.Dispatch<React.SetStateAction<ResultState>>;
  pipelineValuesStages: PipelineCycleResult;
  setPipelineValuesStages: React.Dispatch<React.SetStateAction<PipelineCycleResult>>;
}

const CurrentInstContext = createContext<CurrentInstContextType>({
  currentMonocycletInst: initialCurrentInstState, 
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
  const [currentMonocycletInst, setCurrentMonocycleInst] = useState<CurrentInstState>(initialCurrentInstState);
  const [currentMonocycleResult, setCurrentMonocycleResult] = useState<ResultState>(initialResultState);
  const [currentType, setCurrentType] = useState<string>("");
  const [pipelineValuesStages, setPipelineValuesStages] = useState<PipelineCycleResult>(initialPipelineValues);

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
      }}
    >
      {children}
    </CurrentInstContext.Provider>
  );
};