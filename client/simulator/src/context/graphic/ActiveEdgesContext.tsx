import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from "react";

type ActiveEdgesContextType = {
 activeEdges: string[];
 setActiveEdges: Dispatch<SetStateAction<string[]>>;
};

const ActiveEdgesContext = createContext<ActiveEdgesContextType>({
 activeEdges: [],
  setActiveEdges: () => {},
});

export const useActiveEdges = () => useContext(ActiveEdgesContext);

export const ActiveEdgesProvider = ({ children }: { children: ReactNode }) => {
 const [activeEdges, setActiveEdges] = useState<string[]>([]);

 return (
 <ActiveEdgesContext.Provider value={{ activeEdges, setActiveEdges }}>
  {children}
  </ActiveEdgesContext.Provider>
 );
};