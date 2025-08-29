import { useSimulator } from "@/context/shared/SimulatorContext";
import ManualConfig from "@/components/panel/Settings/ManualConfig/ManualConfig";
import StepConfig from "@/components/panel/Settings/Step/StepConfig";
import SwitchSeeRegistersChanged from "@/components/panel/Settings/SwitchSeeRegistersChanged";
import ExportRegisters from "../Settings/Step/ExportRegisters";
import ExportMemory from "../Settings/Step/ExportMemory";
import SwitchAutoFocusOnNewLine from "../Settings/SwitchAutoFocusOnNewLine";

const SettingsSection = () => {
  const { operation } = useSimulator();
  return (
    <div className="mt-1 section-container" id="settings-section">
      <div className="flex flex-col gap-8">
        
        {operation === "uploadMemory" && <ManualConfig />}
        {operation === "step" && <StepConfig />}

        <div className="flex flex-col gap-2" id="export-data">
          <p>Export data</p>
          <div className="flex items-center gap-3 mt-2">
            <ExportRegisters />
            <ExportMemory />
          </div>
        </div>

        <div id="custom-options">
          <SwitchSeeRegistersChanged />
          <SwitchAutoFocusOnNewLine />
        </div>
      </div>
    </div>
  );
};

export default SettingsSection;
