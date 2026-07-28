import { useEffect, useRef } from "react";
import { useSimulator } from "@/context/shared/SimulatorContext";
import { useMemoryTable, type MemoryData } from "@/context/shared/MemoryTableContext";
import { useRegistersTable } from "@/context/panel/RegisterTableContext";
import { useDialog } from "@/context/panel/DialogContext";
import { useLines } from "@/context/panel/LinesContext";
import { useShell } from "@/context/shell/ShellContext";
import { useCurrentInst, type ParsedInstruction } from "@/context/graphic/CurrentInstContext";
import { parseExtensionMessage } from "@protocol/messages";
import type { MonocycleWires, PipelineStages } from "@protocol/datapath-view";

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
      // Boundary parse replaces the old `from === "UIManager"` source guard:
      // anything that is not a well-formed extension message (including the
      // webview's own outbound posts) parses to null and is dropped here
      // (ADR-0005, ticket 06).
      const message = parseExtensionMessage(event.data);
      if (message === null) {
        return;
      }

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
          // The upload payload crosses opaquely; the memory-table consumer
          // narrows it to its own `MemoryData` shape here (ADR-0005).
          const uploadPayload = message.payload as unknown as MemoryData;
          setDataMemoryTable(uploadPayload);
          setTypesInstruction(message.typesInstruction as { type: string }[]);
          setSizeMemory(uploadPayload.memory.length);
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
            setPipelineValuesStages(message.result as unknown as PipelineStages);
          } else {
            // The `step` payload crosses opaquely (`DatapathView`); the pane
            // narrows it to its concrete view now that the CPU is known from
            // `typeSimulator` (ADR-0005). `currentMonocycletInst` is likewise
            // pinned to the client's decoded-instruction shape.
            const inst = message.currentMonocycletInst as ParsedInstruction | null;
            setCurrentMonocycleInst(inst);
            if (inst?.asm?.toLowerCase() === "ebreak") {
              setIsEbreak(true);
            }
            setCurrentMonocycleResult(message.result as unknown as MonocycleWires);
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
