import { Button } from "@/components/panel/ui/button";
import { Save } from "lucide-react";
import { useMemoryTable } from "@/context/panel/MemoryTableContext";
import { useState } from "react";

const ExportMemory = () => {
  const { dataMemoryTable } = useMemoryTable();
  const [_, setFileUrl] = useState<string | null>(null);

  const handleExport = () => {
    if (!dataMemoryTable?.memory || dataMemoryTable.codeSize === 0) return;

    const memory = dataMemoryTable.memory;
    const codeSize = dataMemoryTable.codeSize;

    const hexLines: string[] = [];

    for (let i = 0; i < codeSize; i += 4) {
      const group: string[] = [];

      for (let j = 0; j < 4; j++) {
        const index = i + j;
        const binaryString = memory[index];
        if (binaryString) {
          const hexValue = parseInt(binaryString, 2).toString(16).toUpperCase();
          group.push(hexValue);
        }
      }

      hexLines.push(...group.reverse());
    }

    const fileContent = hexLines.join("\n");

    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    setFileUrl(url);

    const link = document.createElement("a");
    link.href = url;
    link.download = "instructions_hex.hex";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-2 ml-4">
      <input type="file" id="fileInputExportMemory" accept=".txt" className="hidden" />
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" id="exportMemoryBtn" onClick={handleExport}>
          <Save strokeWidth={1} />
        </Button>
        <p className="text-gray">Memory (program)</p>
      </div>
    </div>
  );
};

export default ExportMemory;
