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
    const DEPTH = memory.length / 4; 


    const hexWords: string[] = [];

    // Agrupar cada 4 bytes en una palabra de 32 bits en orden little-endian
    for (let i = 0; i < codeSize; i += 4) {
      let word = "";

      for (let j = 3; j >= 0; j--) {
        const index = i + j;
        const binaryString = memory[index] || "00000000";
        const hex = parseInt(binaryString, 2).toString(16).padStart(2, "0").toUpperCase();
        word += hex;
      }

      hexWords.push(word);
    }

    let fileContent = "";
    let fileName = "";
    let fileType = "text/plain;charset=utf-8";

    if (format === "hex") {
      fileContent = hexWords.join("\n");
      fileName = "instructions_hex.hex";
    } else if (format === "mif") {
      // Construir el archivo .mif con el formato de la imagen
      const mifHeader = `-- RISC-V program memory (word addressed)
WIDTH=32;
DEPTH=${DEPTH};

ADDRESS_RADIX=HEX;
DATA_RADIX=HEX;

CONTENT BEGIN
`;

      const mifBody = hexWords
        .map((word, index) => `${index.toString(16).toUpperCase().padStart(2, "0")} : ${word};`)
        .join("\n");

      const nextAddr = codeSize / 4;
      const finalAddr = DEPTH - 1;
      const zeroFill = `[${nextAddr.toString(16).toUpperCase().padStart(2, "0")}..${finalAddr
        .toString(16)
        .toUpperCase()}] : 00000000;`;

      const mifFooter = `
${zeroFill}
END;`;

      fileContent = mifHeader + mifBody + mifFooter;
      fileName = "instructions_mif.mif";
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
