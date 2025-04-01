// OverlayContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";

type OverlayContextType = {
  overlayDecodeActive: boolean;
  setOverlayDecodeActive: (active: boolean) => void;
};

const OverlayContext = createContext<OverlayContextType>({
    overlayDecodeActive: false,
  setOverlayDecodeActive: () => {},
});

export const useOverlay = () => useContext(OverlayContext);

export const OverlayProvider = ({ children }: { children: ReactNode }) => {
  const [overlayDecodeActive, setOverlayDecodeActive] = useState(false);

  return (
    <OverlayContext.Provider value={{ overlayDecodeActive, setOverlayDecodeActive }}>
      {children}
    </OverlayContext.Provider>
  );
};
