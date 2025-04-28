
import { Button } from "@/components/panel/ui/button";
import { Save } from "lucide-react";

const ExportMemory = () => {
  

  return (
    <div className="flex items-center gap-2 ml-4">
      <input
        type="file"
        id="fileInputExportMemory"
        accept=".txt"
        className="hidden"
      />
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          id="exportMemoryBtn"
        >
          <Save strokeWidth={1} />
        </Button>
        <p className="text-gray">Memory</p>
      </div>
    </div>
  );
};

export default ExportMemory;
