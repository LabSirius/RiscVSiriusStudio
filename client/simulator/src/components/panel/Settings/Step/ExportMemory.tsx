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
    const codeSize = dataMemoryTable.codeSize;

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
      const asmList = dataMemoryTable.asmList || [];
      const instructionCount = codeSize / 4;

      const mifHeader = `-- RISC-V program memory (byte addressed)
WIDTH=8;
DEPTH=8192;

ADDRESS_RADIX=UNS;
DATA_RADIX=HEX;

DEFAULT_RADIX=HEX
DEFAULT_VALUE=00

CONTENT BEGIN
`;

      const mifBodyLines: string[] = [];
      let constantsCommentAdded = false;

      for (let i = 0; i < codeSize; i++) {
        if (i % 4 === 0) {
          const index = i / 4;
          if (index < instructionCount && asmList[index]) {
            let word = "";
            for (let j = 3; j >= 0; j--) {
              const byteIndex = i + j;
              const byteBinary = memory[byteIndex] || "00000000";
              const byteHex = binaryToHex(byteBinary).padStart(2, "0").toUpperCase();
              word += byteHex;
            }
            const pcHex = i.toString(16).toUpperCase().padStart(8, "0");
            mifBodyLines.push(`  -- ${word} (PC 0x${pcHex}) ${asmList[index]}`);
          }

          if (!constantsCommentAdded && !asmList[index]) {
            mifBodyLines.push(`  -- CONSTANTS`);
            constantsCommentAdded = true;
          }

          console.log("i:", i, "codeSize:", asmList[index]);
        }

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
