import { useSimulator } from "@/context/shared/SimulatorContext";
import ManualConfig from "@/components/panel/Settings/ManualConfig/ManualConfig";
import StepConfig from "@/components/panel/Settings/Step/StepConfig";
import SwitchSeeRegistersChanged from "@/components/panel/Settings/SwitchSeeRegistersChanged";
import ExportRegisters from "../Settings/Step/ExportRegisters";
import ExportMemory from "../Settings/Step/ExportMemory";

const SettingsSection = () => {
  const { operation } = useSimulator();
  return (
    <div className="mt-1 section-container">
      <div className="flex flex-col gap-8">
        {operation === "uploadMemory" && <ManualConfig />}
        {operation === "step" && <StepConfig />}
        <div className="flex flex-col gap-2 mt-1">
          <p>Export data</p>
          <div className="flex items-center gap-3 mt-2">
            <ExportRegisters />
            <ExportMemory />
          </div>
        </div>
        <SwitchSeeRegistersChanged />
      </div>
    </div>
  );
};

export default SettingsSection;
