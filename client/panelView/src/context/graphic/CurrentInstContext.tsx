import { createContext, useContext, useState, ReactNode } from "react";

interface CurrentInstState {
      type: string;
      opcode: string
      asm: string;
      encoding: {
        hexEncoding: string;
        binEncoding: string;
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


interface CurrentInstContextType {
  currentInst: CurrentInstState;
  setCurrentInst: React.Dispatch<React.SetStateAction<CurrentInstState>>;

  currentType: string;
  setCurrentType: React.Dispatch<React.SetStateAction<string>>;

  currentImm: string | number;
  setCurrentImm: React.Dispatch<React.SetStateAction<string | number>>;

  currentRs1: string;
  setCurrentRs1: React.Dispatch<React.SetStateAction<string>>;

  currentRs2: string;
  setCurrentRs2: React.Dispatch<React.SetStateAction<string>>;
}

const CurrentInstContext = createContext<CurrentInstContextType>({
  currentInst: {
      
        type: "",
        opcode: "",
        asm: "",
        encoding: {
          hexEncoding: "",
          binEncoding: "",
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
    


  setCurrentInst: () => {},

  currentType: "",
  setCurrentType: () => {},

  currentImm: "",
  setCurrentImm: () => {},

  currentRs1: "",
  setCurrentRs1: () => {},

  currentRs2: "",
  setCurrentRs2: () => {},
});

export const useCurrentInst = () => useContext(CurrentInstContext);
export const CurrentInstProvider = ({ children }: { children: ReactNode }) => {
  const [currentInst, setCurrentInst] = useState<CurrentInstState>({
        type: "",
        opcode: "",
        asm: "",
        encoding: {
          hexEncoding: "",
          binEncoding: "",
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
);
  const [currentType, setCurrentType] = useState<string>("");
  const [currentImm, setCurrentImm] = useState<string | number>("");
  const [currentRs1, setCurrentRs1] = useState<string>("");
  const [currentRs2, setCurrentRs2] = useState<string>("");

  return (
    <CurrentInstContext.Provider value={{ currentInst, setCurrentInst, currentType, setCurrentType, currentImm, setCurrentImm, currentRs1, setCurrentRs1, currentRs2, setCurrentRs2 }}>
      {children}
    </CurrentInstContext.Provider>
  );
};
