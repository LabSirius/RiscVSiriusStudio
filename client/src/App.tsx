import { ThemeProvider } from "@/components/ui/theme/theme-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sideBar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import WelcomeSection from "./Sections/WelcomeSection";

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex h-full w-full overflow-hidden ">
        <SidebarProvider>
          <AppSidebar />
          <SidebarTrigger />
          <WelcomeSection />
        </SidebarProvider>
      </div>
    </ThemeProvider>
  );
};

export default App;
