import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./main.css";
import App from "./App.tsx";
import { SimulatorProvider } from "./context/shared/SimulatorContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SimulatorProvider>
      <App />
    </SimulatorProvider>
  </StrictMode>
);
