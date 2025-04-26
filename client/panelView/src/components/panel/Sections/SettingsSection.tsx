import { useOperation } from "@/context/panel/OperationContext";
import ManualConfig from '@/components/panel/Settings/ManualConfig/ManualConfig'
import StepConfig from "@/components/panel/Settings/Step/StepConfig";
import SwitchSeeRegistersChanged from "@/components/panel/Settings/SwitchSeeRegistersChanged";

const SettingsSection = () => {
  const { operation } = useOperation();
  return (
      <div className="mt-1 section-container">
        <div className="flex flex-col gap-8">
          {operation === "uploadMemory" && <ManualConfig />}
          {operation === "step" && <StepConfig />}
          <SwitchSeeRegistersChanged />
        </div>
      </div>
  );
};

export default SettingsSection;
