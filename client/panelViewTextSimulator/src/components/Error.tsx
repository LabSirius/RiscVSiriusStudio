import { useEffect, useState } from "react";
import { useError } from "@/context/ErrorContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Ban} from "lucide-react";  

const Error = () => {
  const { error, setError } = useError();
  const [open, setOpen] = useState(false);

 
  useEffect(() => {
    if (error) {
      setOpen(true);
    }
  }, [error]);

  const handleAccept = () => {
    setOpen(false);
    setError(undefined);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-[#3A6973]">
            <Ban className="w-6 h-6 mr-2" />
            {error?.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[1rem] text-start">
            {error?.description}
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

export default Error;
