import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

import { useSimulator } from "@/context/shared/SimulatorContext";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

const ChangeTypeSimulator = () => {
  const { typeSimulator, setTypeSimulator } = useSimulator();
  // 1. Estado para controlar si el modal está abierto o cerrado
  const [isOpen, setIsOpen] = useState(false);

  const handleSelection = (newType:string) => {
    if (newType) {
      setTypeSimulator(newType); 
      setIsOpen(false);        
    }
  };

  return (
    // Usamos `open` y `onOpenChange` para controlar el estado del Dialog
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <RefreshCcw />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Choose Processor Type</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <RadioGroup
            value={typeSimulator}
            onValueChange={handleSelection} 
          >
            <div className="flex items-center space-x-3 p-1 rounded-md hover:bg-accent cursor-pointer">
              <RadioGroupItem value="monocycle" id="r_monocycle" />
              <Label htmlFor="r_monocycle" className="cursor-pointer ">
                Monocycle
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-1 rounded-md hover:bg-accent cursor-pointer">
              <RadioGroupItem value="pipeline" id="r_pipeline" />
              <Label htmlFor="r_pipeline" className="cursor-pointer ">
                Pipeline
              </Label>
            </div>
          </RadioGroup>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeTypeSimulator;