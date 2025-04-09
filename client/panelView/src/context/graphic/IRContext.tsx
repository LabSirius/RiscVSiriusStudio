import { createContext, useContext, useState, ReactNode } from "react";

interface IRState {
  instructions: [
    {
      type: string;
      opcode: string
      asm: string;
      encoding: {
        hexEncoding: string;
        binaryEncoding: string;
        funct3: string;
        funct7: string;
        rs1?: string;
        rs2?: string;
        rd?: string;
        imm13?: string;
      },
      rd?:{
        regenc: string;
        
      },
      rs1?:{
        regenc: string;
      },
      rs2?:{
        regenc: string;
      },
      imm12?: number,
      imm21?: number
    }
  ];
  symbols: Record<string, Record<string, string>>;
}

interface IRContextType {
  ir: IRState;
  setIr: React.Dispatch<React.SetStateAction<IRState>>;

  currentType: string;
  setCurrentType: React.Dispatch<React.SetStateAction<string>>;

  currentImm: string | number;
  setCurrentImm: React.Dispatch<React.SetStateAction<string | number>>;

  currentRs1: string;
  setCurrentRs1: React.Dispatch<React.SetStateAction<string>>;

  currentRs2: string;
  setCurrentRs2: React.Dispatch<React.SetStateAction<string>>;
}

const IRContext = createContext<IRContextType>({
  ir: {
    instructions: [
      {
        type: "",
        opcode: "",
        asm: "",
        encoding: {
          hexEncoding: "",
          binaryEncoding: "",
          funct3: "",
          funct7: "",
          rs1: "",
          rs2: "",
          rd: "",
          imm13: ""
        },
        rd:{ 
          regenc: "",
        },
        rs1:{
          regenc: "",
        },
        rs2:{
          regenc: "",
        },
        imm12: 0,
        imm21: 0
      },
    ],
    symbols: {
      loop: {},
      end: {},
    },
  },
  setIr: () => {},

  currentType: "",
  setCurrentType: () => {},

  currentImm: "",
  setCurrentImm: () => {},

  currentRs1: "",
  setCurrentRs1: () => {},

  currentRs2: "",
  setCurrentRs2: () => {},
});

export const useIR = () => useContext(IRContext);
export const IRProvider = ({ children }: { children: ReactNode }) => {
  const [ir, setIr] = useState<IRState>({
    instructions: [
      {
        type: "",
        opcode: "",
        asm: "",
        encoding: {
          hexEncoding: "",
          binaryEncoding: "",
          funct3: "",
          funct7: "",
          rs1: "",
          rs2: "",
          rd: "",
          imm13: ""
        },
        rd:{ 
          regenc: "",
        },
        rs1:{
          regenc: "",
        },
        rs2:{
          regenc: "",
        },
        imm12: 0,
        imm21: 0
      },
    ],
    symbols: {
      loop: {},
      end: {},
    },
  });
  const [currentType, setCurrentType] = useState<string>("");
  const [currentImm, setCurrentImm] = useState<string | number>("");
  const [currentRs1, setCurrentRs1] = useState<string>("");
  const [currentRs2, setCurrentRs2] = useState<string>("");

  return (
    <IRContext.Provider value={{ ir, setIr, currentType, setCurrentType, currentImm, setCurrentImm, currentRs1, setCurrentRs1, currentRs2, setCurrentRs2 }}>
      {children}
    </IRContext.Provider>
  );
};
