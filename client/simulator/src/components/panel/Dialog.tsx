import { useEffect, useState } from "react";
import { useDialog } from "@/context/panel/DialogContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Info, Settings } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useSimulator } from "@/context/shared/SimulatorContext";
import { sendMessage } from "../Message/sendMessage";

const Dialog = () => {
  const { dialog, setDialog } = useDialog();
  const [open, setOpen] = useState(false);
  const { typeSimulator, setTypeSimulator, setShowTuto } = useSimulator();

  // This logic is fine, no changes needed here.
  // It handles the selection but doesn't close the dialog, which is correct
  // since the user confirms with the "Accept" button.
  const handleSelection = (newType: string) => {
    if (newType) {
      setTypeSimulator(newType as "monocycle" | "pipeline");
    }
  };

  useEffect(() => {
    if (dialog) {
      setOpen(true);
    }
  }, [dialog]);

  const handleAccept = () => {
    setOpen(false);
    setDialog(undefined);

    sendMessage({ event: typeSimulator });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        {" "}
        {/* Removed custom z-index, shadcn handles this */}
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-[#3A6973]">
            {dialog?.stop ? (
              <Info className="w-6 h-6 mr-2" />
            ) : (
              <Settings className="w-6 h-6 mr-2" />
            )}
            {dialog?.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-start text-foreground">
            <div className="text-xs mt-1">{dialog?.description}</div>

            {dialog?.chooseTypeSimulator && (
              <div className="py-4">
                {/* 1. Title for the simulator type selection. */}
                <p className="mb-3 font-medium text-[.8rem]">Choose Type Simulator</p>

                <RadioGroup
                  value={typeSimulator}
                  onValueChange={handleSelection}
                  className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="monocycle" id="r_monocycle" />
                    <Label htmlFor="r_monocycle" className="cursor-pointer">
                      Monocycle
                    </Label>
                  </div>

                  {/* 4. Structure for "Pipeline" radio item. */}
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pipeline" id="r_pipeline" />
                    <Label htmlFor="r_pipeline" className="cursor-pointer">
                      Pipeline <span className="text-[.6rem] bg-blue-400 p-1 rounded-[0.4rem] ">Beta</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex w-full gap-5 items-center">
          

          {!dialog?.stop && (
            <AlertDialogAction
              onClick={() => setShowTuto(true)}
              className="!bg-transparent !border-none text-[.8rem] underline text-[#3A6973] cursor-pointer">
              Show tutorial
            </AlertDialogAction>
          )}

         <AlertDialogAction onClick={handleAccept}>Accept</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default Dialog;
