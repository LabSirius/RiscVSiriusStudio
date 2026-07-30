import { Save } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/theme/dropdown-menu";
import { useMemoryTable } from "@/context/shared/MemoryTableContext";
import {
  exportProgramMemoryHex,
  exportProgramMemoryMif,
} from "@/utils/tables/programMemoryExport";

/** Triggers a browser download of `content` as `fileName`. */
function downloadTextFile(content: string, fileName: string, fileType: string) {
  const blob = new Blob([content], { type: fileType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Program-memory export control living in the program-memory toolbar band (was
 * the Settings panel's ExportMemory). A Save icon opens a hex / `.mif` dropdown;
 * the formatting is the shared `programMemoryExport` helper, so the output is
 * byte-identical to the old panel. Reads the exact rows the table shows
 * (`dataMemoryTable.program`), so it works after both uploadMemory and step.
 */
const ExportProgramMemory = () => {
  const { dataMemoryTable } = useMemoryTable();

  const handleExport = (format: "hex" | "mif") => {
    const program = dataMemoryTable?.program;
    if (!program || program.length === 0) return;

    if (format === "hex") {
      downloadTextFile(
        exportProgramMemoryHex(program),
        "program_memory.hex",
        "text/plain;charset=utf-8"
      );
    } else {
      downloadTextFile(
        exportProgramMemoryMif(program, dataMemoryTable.asmList ?? []),
        "memory.mif",
        "application/octet-stream"
      );
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          title="Export program memory"
          className="cursor-pointer text-black transition-transform hover:scale-110 dark:text-white">
          <Save strokeWidth={1.5} className="min-w-[1.3rem] min-h-[1.3rem] w-[1.3rem] h-[1.3rem]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleExport("hex")}>Verilog (.hex)</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("mif")}>.mif</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportProgramMemory;
