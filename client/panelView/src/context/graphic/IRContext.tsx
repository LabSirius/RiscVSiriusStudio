import { createContext, useContext, useState, ReactNode } from "react";

interface IRState {
  instructions: [
    {
      type: string;
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
