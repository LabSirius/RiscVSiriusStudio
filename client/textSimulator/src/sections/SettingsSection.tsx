import { useOperation } from "@/context/OperationContext";
import ManualConfig from "../components/Settings/ManualConfig/ManualConfig";
import StepConfig from "@/components/Settings/Step/StepConfig";
import SwitchSeeRegistersChanged from "@/components/Settings/SwitchSeeRegistersChanged";

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
