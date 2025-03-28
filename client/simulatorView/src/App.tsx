//import { ThemeProvider } from "@/components/ui/theme/theme-provider";
import MyCanvas from "./components/Canvas";

const App = () => {
  return (
    //<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="relative flex w-full h-full overflow-hidden ">
          <MyCanvas /> {/* here we import the canvas component */}
      </div>
    //</ThemeProvider>
  );
};

export default App;
