import React, { useRef } from "react";
import { useRegistersTable } from "@/context/RegisterTableContext";
import { registersNames } from "@/constants/data";

import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

const ImportRegister = () => {

    const { setImportRegister } = useRegistersTable();
    const fileInputRegisterRef = useRef<HTMLInputElement>(null);

    const handleRegisterImportClick = () => {
      fileInputRegisterRef.current?.click();
    };
  
    const handleRegisterFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        if (lines.length !== 32) {
          //console.log("Número inválido de líneas");
          return;
        }
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].length !== 32) {
            //console.log(`Longitud inválida en la línea ${i}`);
            return;
          }
        }
  
        const newData = registersNames.map((reg, index) => ({
          name: reg,
          rawName: reg.split(" ")[0],
          value: index === 0 ? "00000000000000000000000000000000" : lines[index],
          viewType: 2,
          watched: false,
          modified: 0,
          id: index,
        }));
  
        setImportRegister(newData);
        
      };
      reader.readAsText(file);
    };

   
    return (
        <div className="flex items-center gap-2">
            <input
              type="file"
              id="fileInputImportRegister"
              accept=".txt"
              className="hidden"
              ref={fileInputRegisterRef}
              onChange={handleRegisterFileChange}
            />
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                id="importRegisterBtn"
                onClick={handleRegisterImportClick}
              >
                <FileDown strokeWidth={1} />
              </Button>
              <p className="text-gray">Registers</p>
            </div>
          </div>
    )
}

export default ImportRegister