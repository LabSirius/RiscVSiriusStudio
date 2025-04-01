//import { ThemeProvider } from "@/components/ui/theme/theme-provider";
import Sections from "./components/sections/Sections";
import { OverlayProvider } from "./context/OverlayContext";

const App = () => {
  return (
    //<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <OverlayProvider>
      <div style={{ width: '100vw', height: '100vh' }} className="relative flex overflow-hidden ">
          <Sections /> {/* here we import the canvas component */}
      </div>
    </OverlayProvider>
    //</ThemeProvider>
  );
};

export default App;
