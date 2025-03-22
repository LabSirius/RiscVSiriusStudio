import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ErrorObject {
  title: string;
  description: string;
}

interface ErrorContextProps {
  error: ErrorObject;
  setError: React.Dispatch<React.SetStateAction<ErrorObject>>;
}

const ErrorContext = createContext<ErrorContextProps | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [error, setError] = useState<ErrorObject>({ title: '', description: '' });

  return (
    <ErrorContext.Provider value={{ error, setError }}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = (): ErrorContextProps => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError debe usarse dentro de un ErrorProvider');
  }
  return context;
};
