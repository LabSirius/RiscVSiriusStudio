import { ThemeProvider } from "@/components/ui/theme/theme-provider";


const App = () => {
  return (
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
              <div className="relative flex w-full h-full overflow-hidden ">
                  <h1>RISCARD</h1>
              </div>
            </ThemeProvider>
  );
};

export default App;
