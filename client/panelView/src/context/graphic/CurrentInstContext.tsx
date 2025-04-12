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


interface ResultState{
  alu: {
    a: string;
    b: string;
    operation: string;
    result: string;
  }
  ru: {
    rs1: string;
    rs2: string;
    dataWrite: string;
    writeSignal: string;
  }
}


interface CurrentInstContextType {
  currentInst: CurrentInstState;
  setCurrentInst: React.Dispatch<React.SetStateAction<CurrentInstState>>;

  currentType: string;
  setCurrentType: React.Dispatch<React.SetStateAction<string>>;

  currentImm: string | number;
  setCurrentImm: React.Dispatch<React.SetStateAction<string | number>>;

  currentResult: ResultState;
  setCurrentResult: React.Dispatch<React.SetStateAction<ResultState>>;
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

  currentResult: {
    alu: {
      a: "",
      b: "",
      operation: "",
      result: ""
    },
    ru: {
      rs1: "",
      rs2: "",
      dataWrite: "",
      writeSignal: ""
    }
  },
  setCurrentResult: () => {}
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

  const [currentResult, setCurrentResult] = useState<ResultState>({
    alu: {
      a: "",
      b: "",
      operation: "",
      result: ""
    },
    ru: {
      rs1: "",
      rs2: "",
      dataWrite: "",
      writeSignal: ""
    }
  });

  return (
    <CurrentInstContext.Provider value={{ currentInst, setCurrentInst, currentType, setCurrentType, currentImm, setCurrentImm, currentResult, setCurrentResult }}>
      {children}
    </CurrentInstContext.Provider>
  );
};
