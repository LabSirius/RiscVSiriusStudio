import { useEffect } from "react";
import { useSimulator } from "@/context/shared/SimulatorContext";
import { useMemoryTable } from "@/context/panel/MemoryTableContext";
import { useRegistersTable } from "@/context/panel/RegisterTableContext";
import { useDialog } from "@/context/panel/DialogContext";
import { useLines } from "@/context/panel/LinesContext";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";

const MessageListener = () => {
  const {
    setDataMemoryTable,
    setWriteInMemory,
    setSizeMemory,
    setReadInMemory,
    setIsCreatedMemoryTable,
  } = useMemoryTable();

  const {
    typeSimulator,
    setTypeSimulator,
    setTextProgram,
    setOperation,
    isFirstStep,
    setIsFirstStep,
    setSection,
    setNewPc,
  } = useSimulator();
  const { setWriteInRegister } = useRegistersTable();
  const { setCurrentInst, setCurrentResult } = useCurrentInst();

  const { setLineDecorationNumber, setClickInEditorLine } = useLines();
  const { setDialog } = useDialog();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message?.from === "UIManager") {
        switch (message.operation) {
          case "simulatorType":
            setTypeSimulator(message.simulatorType);
            break;
          case "textProgram":
            setTextProgram(message.textProgram);
            break;
          case "uploadMemory":
            if (!(typeSimulator === "graphic")) {
              setDialog({
                title: "Configuration Info",
                description:
                  "Before executing the first instruction, you can change the simulation settings by clicking the corresponding icon in the drop-down menu.",
                stop: false,
              });
              setSection("settings");
            }
            setIsCreatedMemoryTable(false);
            setDataMemoryTable(message.payload);
            setSizeMemory(message.payload.memory.length - message.payload.codeSize);
            setIsFirstStep(false);
            setOperation("uploadMemory");
            break;
          case "decorateLine":
            setLineDecorationNumber(message.lineDecorationNumber);
            break;
          case "step":
            setNewPc(message.newPc);
            setCurrentInst(message.currentInst);
            setCurrentResult(message.result);
            if (message.lineDecorationNumber !== undefined) {
              setLineDecorationNumber(message.lineDecorationNumber);
            } else {
              setLineDecorationNumber(-1);
            }
            if (!isFirstStep) {
              if (typeSimulator === "graphic") {
                setSection("program");
              } else {
                setSection("search");
              }
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
            setDialog({ title: "Info", description: "The program has ended.", stop: true });

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

  useEffect(() => {
    if (typeSimulator == "graphic") {
      setDialog({
        title: "Configuration Info",
        description:
          "Before executing the first instruction, you can change the simulation settings by clicking the corresponding icon in the drop-down menu.",
        stop: false,
      });
      setSection("program");
    }
  }, [typeSimulator, setSection, setOperation, setDialog]);

  return null;
};

export default MessageListener;
