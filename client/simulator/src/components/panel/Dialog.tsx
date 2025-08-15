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

import { Info, Lock, Settings } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useSimulator } from "@/context/shared/SimulatorContext";
// import { sendMessage } from "../Message/sendMessage";

const Dialog = () => {
  const { dialog } = useDialog();
  const [open, setOpen] = useState(false);
  const { typeSimulator } = useSimulator();

  // This logic is fine, no changes needed here.
  // It handles the selection but doesn't close the dialog, which is correct
  // since the user confirms with the "Accept" button.
  // const handleSelection = (newType: string) => {
  //   if (newType) {
  //     setTypeSimulator(newType as "monocycle" | "pipeline");
  //   }
  // };

  useEffect(() => {
    if (dialog) {
      setOpen(true);
    }
  }, [dialog]);

  // const handleAccept = () => {
  //   setOpen(false);
  //   setDialog(undefined);

  //     sendMessage({ event: typeSimulator });
    
  // };

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

            {dialog?.descerror && (
              <div className="flex flex-col mt-4">
                <p className="text-red-400 text-xs">ERROR:</p>
                <p className="text-xs">{dialog.descerror}</p>

              </div>
            )}

            {dialog?.chooseTypeSimulator && (
              <div className="py-4">
                {/* 1. Title for the simulator type selection. */}
                <p className="mb-3 font-medium text-[.8rem]">Choose Type Simulator</p>

                <RadioGroup
                  value={typeSimulator}
                  // onValueChange={handleSelection}
                  className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="monocycle" id="r_monocycle" />
                    <Label htmlFor="r_monocycle" className="cursor-pointer">
                      Monocycle
                    </Label>
                  </div>

                  {/* 4. Structure for "Pipeline" radio item. */}
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pipeline" id="r_pipeline" disabled />
                    <Label htmlFor="r_pipeline" className="cursor-pointer text-gray-500 flex items-center gap-3">
                      <p>Pipeline</p>
                      <Lock size={20} strokeWidth={1}/>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction >Accept</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default Dialog;
