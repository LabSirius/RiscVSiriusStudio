import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/theme/dropdown-menu";
import { Save } from "lucide-react";
import { useMemoryTable } from "@/context/shared/MemoryTableContext";
import { useState } from "react";
import {
  exportProgramMemoryHex,
  exportProgramMemoryMif,
} from "@/utils/tables/programMemoryExport";

const ExportMemory = () => {
  const { dataMemoryTable } = useMemoryTable();

  if(!dataMemoryTable) return
  const [_, setFileUrl] = useState<string | null>(null);

  const handleExport = (format: "hex" | "mif") => {
    const {  asmList = [] } = dataMemoryTable || {};

    if (!dataMemoryTable.program || dataMemoryTable.program.length === 0) return;

    let fileContent = "";
    let fileName = "";
    let fileType = "text/plain;charset=utf-8";

    if (format === "hex") {
      fileContent = exportProgramMemoryHex(dataMemoryTable.program);
      fileName = "program_memory.hex";
    } else if (format === "mif") {
      fileContent = exportProgramMemoryMif(dataMemoryTable.program, asmList);
      fileName = "memory.mif";
      fileType = "application/octet-stream";
    }

    const blob = new Blob([fileContent], { type: fileType });
    const url = URL.createObjectURL(blob);
    setFileUrl(url);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url);
    setFileUrl(null);
  };

  return (
    <div className="flex items-center gap-2 ml-4">
      <input type="file" id="fileInputExportMemory" accept=".txt" className="hidden" />
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" id="exportMemoryBtn">
              <Save strokeWidth={1} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleExport("hex")}>Verilog (.hex)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("mif")}>.mif</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <p className="text-gray">Memory</p>
      </div>
    </div>
  );
};

export default ExportMemory;