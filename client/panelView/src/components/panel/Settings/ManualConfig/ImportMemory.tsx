import React, { useRef } from "react";
import { useMemoryTable } from "@/context/panel/MemoryTableContext";
import { useError } from "@/context/panel/ErrorContext";
import { Button } from "@/components/panel/ui/button";
import { Save } from "lucide-react";

const ImportMemory = () => {
  const { setImportMemory, dataMemoryTable, sizeMemory } = useMemoryTable();
  const { setError } = useError();
  const fileInputMemoryRef = useRef<HTMLInputElement>(null);

  const handleMemoryImportClick = () => {
    fileInputMemoryRef.current?.click();
  };

  const handleMemoryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (!content || typeof content !== "string") return;

      const lines = content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line !== "");

      const newData = [];
      for (const line of lines) {
        const parts = line.split(":");
        if (parts.length !== 2) {
          setError({
            title: "Error importing memory",
            description: `Invalid format in line: ${line}`,
          });
          return;
        }
        const addressStr = parts[0].trim();
        const address = parseInt(addressStr, 16);
        if(!dataMemoryTable) return
        if (address < dataMemoryTable.codeSize) {
          setError({
            title: "Error importing memory",
            description: `Cannot import data into the instruction reserved area. Invalid address: ${addressStr.toUpperCase()}`,
          });
          return;
        }
        if (address > sizeMemory + (dataMemoryTable.codeSize - 4)) {
            setError({
              title: "Error importing memory",
              description: `Memory overflow: address ${addressStr} exceeds the allowed limit)`,
            });
            return;
          }
        const binaryValue = parts[1].trim();
        if (binaryValue.length !== 32 || !/^[01]+$/.test(binaryValue)) {
          setError({
            title: "Error importing memory",
            description: `Invalid value in line: ${line}`,
          });
          return;
        }
        
        const value0 = binaryValue.slice(24, 32);
        const value1 = binaryValue.slice(16, 24);
        const value2 = binaryValue.slice(8, 16);
        const value3 = binaryValue.slice(0, 8);
        const hex = [value3, value2, value1, value0]
          .map((val) =>
            parseInt(val, 2).toString(16).padStart(2, "0")
          )
          .join("-")
          .toUpperCase();

        newData.push({
          address: address.toString(16).toLowerCase(),
          value0,
          value1,
          value2,
          value3,
          hex,
        });
      }

      setImportMemory(newData);
    };

    reader.readAsText(file);

    // Limpia el input para permitir reimportar el mismo archivo si es necesario.
    if (fileInputMemoryRef.current) {
      fileInputMemoryRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-2 ml-4">
      <input
        type="file"
        id="fileInputImportMemory"
        accept=".txt"
        className="hidden"
        ref={fileInputMemoryRef}
        onChange={handleMemoryFileChange}
      />
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          id="importMemoryBtn"
          onClick={handleMemoryImportClick}
        >
          <Save strokeWidth={1} />
        </Button>
        <p className="text-gray">Memory</p>
      </div>
    </div>
  );
};

export default ImportMemory;
