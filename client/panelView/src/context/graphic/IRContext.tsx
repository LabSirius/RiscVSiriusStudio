import { createContext, useContext, useState, ReactNode } from "react";

interface IRState {
  instructions: [];
  symbols: Record<string, Record<string, string>>;
}

interface IRContextType {
  ir: IRState;
  setIr: React.Dispatch<React.SetStateAction<IRState>>;
}

const IRContext = createContext<IRContextType>({
  ir: {
    instructions: [],
    symbols: {
      loop: {},
      end: {},
    },
  },
  setIr: () => {},
});

export const useIR = () => useContext(IRContext);
export const IRProvider = ({ children }: { children: ReactNode }) => {
  const [ir, setIr] = useState<IRState>({
    instructions: [],
    symbols: {
      loop: {},
      end: {},
    },
  });

  return (
    <IRContext.Provider value={{ ir, setIr }}>
      {children}
    </IRContext.Provider>
  );
};
