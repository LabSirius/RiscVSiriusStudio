import { useEffect, useState } from "react";
import SimulateAuto from "./SimulateAuto";
import { useSimulator } from "@/context/shared/SimulatorContext";
import { useDialog } from "@/context/panel/DialogContext";
import { useTheme } from "@/components/ui/theme/theme-provider";

const OptionsSimulate = () => {
  const { operation, setSimulateAuto } = useSimulator();
  const [end, setEnd] = useState(false);
  const { dialog } = useDialog();
  const { theme} = useTheme();


  useEffect(() => {
    if (operation === "uploadMemory") {
      setEnd(false);
    }
  }, [operation]);

   useEffect(() => {
    if (dialog && dialog.stop) {
      setSimulateAuto(false);
      setEnd(true);
      return;
    }
  }, [dialog, setSimulateAuto]);

  return (
    <>
      {operation !== "" && !end && (
        <div className={`flex flex-col gap-6 items-center p-2 ${theme === 'light' ? 'bg-gray-200' : 'bg-black' }  rounded-sm mt-3`}>
          <SimulateAuto   />

        </div>
      )}
    </>
  );
};

export default OptionsSimulate;
