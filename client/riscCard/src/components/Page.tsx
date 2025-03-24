import { useTheme } from "@/components/ui/theme/theme-provider"
import { useEffect } from "react"

const Page = () => {
  const { setTheme } = useTheme();

  useEffect(() => {
    if (document.body.classList.contains('vscode-light')) {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  }, [setTheme]);

  
  return (
    <div className="relative flex w-full h-full overflow-hidden ">
      
    </div>
  )
}

export default Page