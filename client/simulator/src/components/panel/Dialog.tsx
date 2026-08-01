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
import { Label } from "@/components/ui/label";
import { useSimulator } from "@/context/shared/SimulatorContext";
import { useMemoryTable } from "@/context/shared/MemoryTableContext";
import {
  isValidMemorySize,
  bytesToWords,
  MIN_MEMORY_BYTES,
  MAX_MEMORY_BYTES,
} from "@protocol/memory";
import { sendMessage } from "../Message/sendMessage";

const Dialog = () => {
  const { dialog, setDialog } = useDialog();
  const { setShowTuto } = useSimulator();
  const { sizeMemory } = useMemoryTable();
  const [open, setOpen] = useState(false);
  const [memBytes, setMemBytes] = useState<string>("");

  const isConfig = !!dialog?.isReset && !dialog?.stop;
  const parsedBytes = Number(memBytes);
  const validSize = isValidMemorySize(parsedBytes);

  useEffect(() => {
    if (dialog) {
      setOpen(true);
      if (dialog.isReset && !dialog.stop) {
        setMemBytes(String(sizeMemory));
      }
    }
  }, [dialog, sizeMemory]);

  const handleAccept = () => {
    if (isConfig) {
      if (!validSize) return;
      sendMessage({ event: "configureMemory", memorySize: parsedBytes });
    }
    setOpen(false);
    setDialog(undefined);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
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

            {isConfig && (
              <div className="py-4">
                <Label
                  htmlFor="dataMemorySize"
                  className="mb-2 block font-medium text-[.8rem]">
                  Data memory size (bytes)
                </Label>
                <input
                  id="dataMemorySize"
                  type="number"
                  min={MIN_MEMORY_BYTES}
                  max={MAX_MEMORY_BYTES}
                  step={4}
                  value={memBytes}
                  onChange={(e) => setMemBytes(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <p className="mt-1 text-[.7rem] text-muted-foreground">
                  {validSize
                    ? `${parsedBytes} bytes = ${bytesToWords(parsedBytes)} words`
                    : `Enter a multiple of 4 between ${MIN_MEMORY_BYTES} and ${MAX_MEMORY_BYTES}.`}
                </p>
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

          <AlertDialogAction
            onClick={handleAccept}
            disabled={isConfig && !validSize}>
            Accept
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default Dialog;
