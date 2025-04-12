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
      },
      rs1?:{
        regenc: string;
      },
      rs2?:{
        regenc: string;
      },
}


interface ResultState{
  alu: {
    a: string;
    b: string;
    operation: string;
    result: string;
  },
  ru: {
    rs1: string;
    rs2: string;
    dataWrite: string;
    writeSignal: string;
  },
  imm: {
    output : string;
    signal: string;
  }
}


interface CurrentInstContextType {
  currentInst: CurrentInstState;
  setCurrentInst: React.Dispatch<React.SetStateAction<CurrentInstState>>;

  currentType: string;
  setCurrentType: React.Dispatch<React.SetStateAction<string>>;

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
        },
        rs1:{
          regenc: "",
        },
        rs2:{
          regenc: "",
        },
  },
    
  setCurrentInst: () => {},

  currentType: "",
  setCurrentType: () => {},


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
    },
    imm: {
      output : "",
      signal: ""
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
        },
        rs1:{
          regenc: "",
        },
        rs2:{
          regenc: "",
        },
      },


);
  const [currentType, setCurrentType] = useState<string>("");

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
    },
    imm: {
      output : "",
      signal: ""
    }
  });

  return (
    <CurrentInstContext.Provider value={{ currentInst, setCurrentInst, currentType, setCurrentType, currentResult, setCurrentResult }}>
      {children}
    </CurrentInstContext.Provider>
  );
};
