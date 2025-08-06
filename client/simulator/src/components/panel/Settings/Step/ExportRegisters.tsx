import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

import { useRegisterData } from "@/context/shared/RegisterData";
import { useState } from "react";

const ExportRegisters = () => {
  const { registerData } = useRegisterData();
  const [_, setFileUrl] = useState<string | null>(null);

  const handleExport = () => {
    if (!registerData || registerData.length === 0) return;

    const fileContent = registerData.join("\n");

    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    setFileUrl(url);

    const link = document.createElement("a");
    link.href = url;
    link.download = "registers.txt";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={handleExport}>
          <Save strokeWidth={1} />
        </Button>
        <p className="text-gray">Registers</p>
      </div>
    </div>
  );
};

export default ExportRegisters;
