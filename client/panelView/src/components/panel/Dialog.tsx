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
} from "@/components/panel/ui/alert-dialog";

import { Info} from "lucide-react";  

const Dialog = () => {
  const { dialog, setDialog } = useDialog();
  const [open, setOpen] = useState(false);

 
  useEffect(() => {
    if (dialog) {
      setOpen(true);
    }
  }, [dialog]);

  const handleAccept = () => {
    setOpen(false);
    setDialog(undefined);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="z-1000000000">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-[#3A6973]">
            <Info className="w-6 h-6 mr-2" />
            {dialog?.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[1rem] text-start">
            {dialog?.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleAccept}>
            Accept
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default Dialog;
