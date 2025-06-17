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
import { binaryToHex } from "@/utils/handlerConversions";

const ExportMemory = () => {
  const { dataMemoryTable } = useMemoryTable();
  const [_, setFileUrl] = useState<string | null>(null);

  const handleExport = (format: "hex" | "mif") => {
    if (!dataMemoryTable?.memory || dataMemoryTable.codeSize === 0) return;

    const memory = dataMemoryTable.memory;
    const codeSize = dataMemoryTable.codeSize; // bytes de código (no toda la memoria)

    const hexWords: string[] = [];

    for (let i = 0; i < codeSize; i += 4) {
      let word = "";
      for (let j = 3; j >= 0; j--) {
        const index = i + j;
        const binaryString = memory[index] || "00000000";
        const hex = binaryToHex(binaryString).padStart(2, "0").toUpperCase();
        word += hex;
      }
      hexWords.push(word);
    }

    let fileContent = "";
    let fileName = "";
    let fileType = "text/plain;charset=utf-8";

    if (format === "hex") {
      const hexBytes: string[] = [];

      for (let i = 0; i < codeSize; i += 4) {
        for (let j = 3; j >= 0; j--) {
          const index = i + j;
          const binaryString = memory[index] || "00000000";
          const hex = binaryToHex(binaryString).padStart(2, "0").toUpperCase();
          hexBytes.push(hex);
        }
      }

      fileContent = hexBytes.join("\n");
      fileName = "instructions_hex.hex";
    } else if (format === "mif") {
      const DEPTH = 8192;
      const mifHeader = `-- RISC-V program memory (byte addressed)
WIDTH=8;
DEPTH=${DEPTH};

ADDRESS_RADIX=UNS;
DATA_RADIX=HEX;

DEFAULT_RADIX=HEX
DEFAULT_VALUE=00

CONTENT BEGIN

`;

      const mifBodyLines: string[] = [];

      for (let i = 0; i < codeSize; i++) {
        const byteBinary = memory[i] || "00000000";
        const byteHex = binaryToHex(byteBinary).padStart(2, "0").toUpperCase();
        mifBodyLines.push(`\t${i} : ${byteHex};`);
      }

      const mifFooter = `END;`;

      fileContent = mifHeader + mifBodyLines.join("\n") + "\n" + mifFooter;
      fileName = "instructions_byte_mif.mif";
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
        <p className="text-gray">Memory (program)</p>
      </div>
    </div>
  );
};

export default ExportMemory;
