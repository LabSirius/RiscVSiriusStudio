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
        rs1: string;
        rs2?: string;
        rd?: string;
        
      }
    }
  ];
  symbols: Record<string, Record<string, string>>;
}

interface IRContextType {
  ir: IRState;
  setIr: React.Dispatch<React.SetStateAction<IRState>>;

  currentType: string;
  setCurrentType: React.Dispatch<React.SetStateAction<string>>;
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
        }
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
        },
        
      },
    ],
    symbols: {
      loop: {},
      end: {},
    },
  });
  const [currentType, setCurrentType] = useState<string>("");

  return (
    <IRContext.Provider value={{ ir, setIr, currentType, setCurrentType }}>
      {children}
    </IRContext.Provider>
  );
};
