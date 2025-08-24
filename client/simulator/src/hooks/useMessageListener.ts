import { useEffect, useRef } from "react";
import { useSimulator } from "@/context/shared/SimulatorContext";
import { useMemoryTable } from "@/context/shared/MemoryTableContext";
import { useRegistersTable } from "@/context/panel/RegisterTableContext";
import { useDialog } from "@/context/panel/DialogContext";
import { useLines } from "@/context/panel/LinesContext";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";

export const useMessageListener = () => {
  const {
    setDataMemoryTable,
    setWriteInMemory,
    setSizeMemory,
    setReadInMemory,
    setIsCreatedMemoryTable,
  } = useMemoryTable();

  const {
    setTypeSimulator,
    modeSimulator,
    setModeSimulator,
    setTextProgram,
    setOperation,
    isFirstStep,
    setIsFirstStep,
    setSection,
    setNewPc,
    setIsEbreak,
  } = useSimulator();
  const { setWriteInRegister } = useRegistersTable();
  const { setCurrentMonocycleInst, setCurrentMonocycleResult, setPipelineValuesStages } = useCurrentInst();

  const { setLineDecorationNumber, setClickInEditorLine } = useLines();
  const { setDialog } = useDialog();

  const modeSimulatorRef = useRef(modeSimulator);
  useEffect(() => {
    modeSimulatorRef.current = modeSimulator;
  }, [modeSimulator]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message?.from === "UIManager") {
        switch (message.operation) {
          case "simulatorType":
            setModeSimulator(message.simulatorType);
            break;
          case "textProgram":
            setTextProgram(message.textProgram);
            break;
          case "uploadMemory":
            setDialog({
              title: "Configuration Info",
              description:
                "Before executing the first instruction, you can change the simulation settings.",
              stop: false,
              chooseTypeSimulator: message.typeSimulator === "monocycle" ? true : false,
            });
            setTypeSimulator(message.typeSimulator);
            setSection("settings");
            setIsCreatedMemoryTable(false);
            setDataMemoryTable(message.payload);
            setSizeMemory(message.payload.memory.length);
            setIsFirstStep(false);
            setOperation("uploadMemory");
            setLineDecorationNumber(message.initialLine);

            break;
          case "step":
            console.log("AQUI LLEGA UN MENSAJE STEP", message.result)
            if(message.result.IF){
              console.log("IS PIPELINE")
              setPipelineValuesStages(message.result)
              
            }else{
               setNewPc(message.newPc);
            setCurrentMonocycleInst(message.currentMonocycletInst);
            if (message.currentMonocycletInst?.asm?.toLowerCase() === "ebreak") {
              setIsEbreak(true);
            }

            setCurrentMonocycleResult(message.result);
            if (message.lineDecorationNumber !== undefined) {
              setLineDecorationNumber(message.lineDecorationNumber);
            } else {
              setLineDecorationNumber(-1);
            }
            }

           

            if (!isFirstStep) {
              setSection("search");

              setOperation("step");
              setIsFirstStep(true);
            }
            break;
          case "clickInLine":
            setClickInEditorLine(message.lineNumber);
            break;
          case "setRegister":
            setWriteInRegister({ registerName: message.register, value: message.value });
            break;
          case "writeMemory":
            setWriteInMemory({
              address: message.address,
              value: message.value,
              _length: message._length,
            });
            break;
          case "readMemory":
            setReadInMemory({ address: message.address, value: "1", _length: message._length });
            break;
          case "stop":
            setDialog({
              title: "Info",
              description: "The program has ended.",
              stop: true,
              descerror: message.descerror,
            });
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [
    setOperation,
    setDataMemoryTable,
    setSizeMemory,
    setNewPc,
    setWriteInMemory,
    setReadInMemory,
    setWriteInRegister,
    setSection,
    isFirstStep,
    setIsFirstStep,
    setDialog,
    setIsCreatedMemoryTable,
  ]);
};
