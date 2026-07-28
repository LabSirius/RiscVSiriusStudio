import { useEffect, useRef } from "react";
import { useSimulator } from "@/context/shared/SimulatorContext";
import { useMemoryTable } from "@/context/shared/MemoryTableContext";
import { useRegistersTable } from "@/context/panel/RegisterTableContext";
import { useDialog } from "@/context/panel/DialogContext";
import { useLines } from "@/context/panel/LinesContext";
import { useShell } from "@/context/shell/ShellContext";
import { useCurrentInst } from "@/context/graphic/CurrentInstContext";

export const useMessageListener = () => {
  const {
    setDataMemoryTable,
    setWriteInMemory,
    setSizeMemory,
    setReadInMemory,
    setIsCreatedMemoryTable,
    setTypesInstruction
  } = useMemoryTable();

  const {
    typeSimulator,
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
    setApiKey
  } = useSimulator();
  const { setWriteInRegister } = useRegistersTable();
  const { setCurrentMonocycleInst, setCurrentMonocycleResult, setPipelineValuesStages } =
    useCurrentInst();
  const { setHighlightedLine } = useShell();

  const { setClickInEditorLine } = useLines();
  const { setDialog } = useDialog();

  const modeSimulatorRef = useRef(modeSimulator);
  useEffect(() => {
    modeSimulatorRef.current = modeSimulator;
  }, [modeSimulator]);

  // Host-declared CPU mode, mirrored into a ref so the message handler (bound
  // once) routes the per-CPU datapath payload by the CPU the host announced at
  // `uploadMemory` — not by sniffing the payload's shape (ADR-0005).
  const typeSimulatorRef = useRef(typeSimulator);
  useEffect(() => {
    typeSimulatorRef.current = typeSimulator;
  }, [typeSimulator]);

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

          case "setApiKey":
              setApiKey(message.key)
            break
          case "uploadMemory":
        
            setDialog({
              title: "Configuration Info",
              description:
                "Before executing the first instruction, you can change the simulation settings.",
              stop: false,
              isReset: message.isReset,
            });
            setTypeSimulator(message.typeSimulator);
            setSection("settings");
            setIsCreatedMemoryTable(false);
            setDataMemoryTable(message.payload);
            setTypesInstruction(message.typesInstruction)
            setSizeMemory(message.payload.memory.length);
            setIsFirstStep(false);
            setOperation("uploadMemory");
            setHighlightedLine(message.initialLine);

            break;
          case "step":
            // Shell / Cycle effect — CPU-independent, driven every clock off the
            // effect fields the extension now posts uniformly for both CPUs
            // (ADR-0005). No `.IF` probe gates these: the editor highlight
            // follows the retiring instruction and the committed PC advances the
            // memory tables for monocycle and pipeline alike.
            if (message.newPc !== undefined) {
              setNewPc(message.newPc);
            }
            setHighlightedLine(
              message.lineDecorationNumber !== undefined ? message.lineDecorationNumber : -1
            );

            // Datapath render payload — per-CPU, routed to the pane the host's
            // declared CPU mode selected at mount. No `.IF` shape probe: the
            // running CPU is known from `typeSimulator`, so each pane's payload
            // reaches only its own context (ADR-0005).
            if (typeSimulatorRef.current === "pipeline") {
              setPipelineValuesStages(message.result);
            } else {
              setCurrentMonocycleInst(message.currentMonocycletInst);
              if (message.currentMonocycletInst?.asm?.toLowerCase() === "ebreak") {
                setIsEbreak(true);
              }
              setCurrentMonocycleResult(message.result);
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
