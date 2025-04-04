import { ThemeProvider } from "@/tables/components/ui/theme/theme-provider";
import Page from "@/tables/components/Page";

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="relative flex w-full h-full overflow-hidden ">
          <Page />
      </div>
    </ThemeProvider>
  );
};

export default App;
