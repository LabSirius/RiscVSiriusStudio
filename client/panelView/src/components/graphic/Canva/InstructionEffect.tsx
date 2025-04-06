import { useIR } from "@/context/graphic/IRContext"
import { useMemoryTable } from "@/context/panel/MemoryTableContext";
import { useEffect } from "react";

const InstructionEffect = () => {
    const { ir} = useIR();
    const { newPc } = useMemoryTable()

    useEffect(() => {
    
        switch (ir.instructions[newPc].type) {
            case "R":
                console.log("R", ir.instructions[newPc])
                break;
            case "I":
                console.log("I", ir.instructions[newPc])
                break;
            case "S":
                console.log("S", ir.instructions[newPc])
                break;
            case "B":
                console.log("B", ir.instructions[newPc])
                break;
            case "J":
                console.log("J", ir.instructions[newPc])
                break;
            case 'U': {
                console.log("U", ir.instructions[newPc])
                break;
            }
        }
            


    }, [newPc, ir])
  return null
}

export default InstructionEffect