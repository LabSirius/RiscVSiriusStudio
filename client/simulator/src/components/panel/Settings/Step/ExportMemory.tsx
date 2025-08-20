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
import { binaryToHex } from "@/utils/handlerConversions";

const ExportMemory = () => {
  const { dataMemoryTable } = useMemoryTable();

  if(!dataMemoryTable) return
  const [_, setFileUrl] = useState<string | null>(null);

  const handleExport = (format: "hex" | "mif") => {
    const { constantsSize, asmList = [] } = dataMemoryTable || {};

    if (!dataMemoryTable.program || dataMemoryTable.program.length === 0) return;

    let fileContent = "";
    let fileName = "";
    let fileType = "text/plain;charset=utf-8";

    if (format === "hex") {
      const hexBytes: string[] = [];
      
      for (let i = 0; i < dataMemoryTable.program.length; i += 4) {
        for (let j = 3; j >= 0; j--) {
          const index = i + j;
          const binaryString = dataMemoryTable.program[index] || "00000000";
          const hex = binaryToHex(binaryString).padStart(2, "0").toUpperCase();
          hexBytes.push(hex);
        }
      }

      fileContent = hexBytes.join("\n");
      fileName = "program_memory.hex";
    } else if (format === "mif") {
      const instructionCount = (dataMemoryTable.program.length - (constantsSize || 0)) / 4;
      const totalWords = dataMemoryTable.program.length / 4;

      const calculateDepth = (words: number): number => {
        const minDepth = 256;
        return words <= minDepth ? minDepth : 2 ** Math.ceil(Math.log2(words));
      };

      const memoryDepth = calculateDepth(totalWords);

      const mifHeader = `-- RISC-V dataMemoryTable.program memory (word addressed)
WIDTH=32;
DEPTH=${memoryDepth};
ADDRESS_RADIX=UNS;
DATA_RADIX=HEX;
CONTENT BEGIN
`;

      const mifBodyLines: string[] = [];
      
      for (let i = 0; i < dataMemoryTable.program.length; i += 4) {
        const wordIndex = i / 4;

        if (wordIndex === instructionCount) {
          mifBodyLines.push(`\n  -- CONSTANTS`);
        }
        
        let word = "";
        for (let j = 3; j >= 0; j--) {
          const byteIndex = i + j;
          const byteBinary = dataMemoryTable.program[byteIndex] || "00000000";
          const byteHex = binaryToHex(byteBinary).padStart(2, "0").toUpperCase();
          word += byteHex;
        }

        const pcHex = i.toString(16).toUpperCase().padStart(8, "0");
        if (wordIndex < asmList.length && asmList[wordIndex]) {
          mifBodyLines.push(`\t${wordIndex} : ${word}; -- (PC 0x${pcHex}) ${asmList[wordIndex]}`);
        } else {
          mifBodyLines.push(`\t${wordIndex} : ${word};`);
        }
      }

      const mifFooter = `\nEND;`;

      fileContent = mifHeader + mifBodyLines.join("\n") + mifFooter;
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
        <p className="text-gray">Memory (dataMemoryTable.program)</p>
      </div>
    </div>
  );
};

export default ExportMemory;