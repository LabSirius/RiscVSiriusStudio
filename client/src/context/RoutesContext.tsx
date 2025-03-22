import React, { createContext, useContext, useState, ReactNode } from 'react';

interface RoutesContextProps {
  routes: string;
  setRoutes: React.Dispatch<React.SetStateAction<string>>;

}

const RoutesContext = createContext<RoutesContextProps | undefined>(undefined);

export const RoutesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [routes, setRoutes] = useState<string>('');
  

  return (
    <RoutesContext.Provider value={{ routes, setRoutes }}>
      {children}
    </RoutesContext.Provider>
  );
};

export const useRoutes = (): RoutesContextProps => {
  const context = useContext(RoutesContext);
  if (!context) {
    throw new Error('useRoutes debe usarse dentro de un RoutesProvider');
  }
  return context;
};
