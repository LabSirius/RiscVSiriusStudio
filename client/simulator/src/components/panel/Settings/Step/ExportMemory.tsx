import { Button } from "@/components/panel/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/graphic/ui/theme/dropdown-menu";
import { Save } from "lucide-react";
import { useMemoryTable } from "@/context/panel/MemoryTableContext";
import { useState } from "react";

const ExportMemory = () => {
  const { dataMemoryTable } = useMemoryTable();
  const [_, setFileUrl] = useState<string | null>(null);

  const handleExport = (format: "hex" | "mif") => {
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

    let fileContent = "";
    let fileName = "";
    let fileType = "text/plain;charset=utf-8";

    if (format === "hex") {
      fileContent = hexLines.join("\n");
      fileName = "instructions_hex.hex";
    } else if (format === "mif") {
      // Placeholder for MIF file generation logic
      // For now, it will download the same hex content but with a .mif extension
      // You'll need to replace this with actual MIF generation
      const mifHeader = `DEPTH = ${codeSize}; -- The size of data in bits\nWIDTH = 8; -- The size of memory in words\nADDRESS_RADIX = HEX; -- The radix for address values\nDATA_RADIX = HEX; -- The radix for data values\nCONTENT\nBEGIN\n`;
      const mifFooter = "\nEND;";
      const mifBody = hexLines
        .map((line, index) => `${index.toString(16).toUpperCase()} : ${line};`)
        .join("\n");
      fileContent = mifHeader + mifBody + mifFooter;
      fileName = "instructions_mif.mif";
      fileType = "application/octet-stream"; // Or appropriate MIF MIME type
    }

    const blob = new Blob([fileContent], { type: fileType });
    const url = URL.createObjectURL(blob);
    setFileUrl(url);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url);
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
            <DropdownMenuItem onClick={() => handleExport("hex")}>
              Verilog (.hex)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("mif")}>
              .mif
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <p className="text-gray">Memory (program)</p>
      </div>
    </div>
  );
};

export default ExportMemory;
