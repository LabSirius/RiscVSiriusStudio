import { useOperation } from "@/context/OperationContext";
import ManualConfig from "../components/Settings/ManualConfig/ManualConfig";
import SwitchHexadecimal from "@/components/SwitchHexadecimal";


const SettingsSection = () => {
  const { operation } = useOperation();
  return (
      <div className="mt-1 section-container">
        <div className="flex flex-col gap-12">
          {operation === "uploadMemory" && <ManualConfig />}
          <SwitchHexadecimal />
        </div>
      </div>
  );
};

export default SettingsSection;
