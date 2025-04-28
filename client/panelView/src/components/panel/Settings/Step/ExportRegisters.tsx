
import { Button } from "@/components/panel/ui/button";
import { Save } from "lucide-react";

const ExportRegisters = () => {
  

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        id="fileInputExportRegisters"
        accept=".txt"
        className="hidden"
      />
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          id="exportRegistersBtn"
        >
          <Save strokeWidth={1} />
        </Button>
        <p className="text-gray">Registers</p>
      </div>
    </div>
  );
};

export default ExportRegisters;
