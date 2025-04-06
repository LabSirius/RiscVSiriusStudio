import { useIR } from "@/context/graphic/IRContext"
import { useMemoryTable } from "@/context/panel/MemoryTableContext";
import { useEffect } from "react";

const InstructionEffect = () => {
    const { ir, setCurrentType} = useIR();
    const { newPc } = useMemoryTable()

    useEffect(() => {
    
        switch (ir.instructions[newPc].type) {
            case "R":
                console.log("R", ir.instructions[newPc])
                setCurrentType("R")
                break;
            case "I":
                console.log("I", ir.instructions[newPc])
                setCurrentType("I")
                break;
            case "S":
                console.log("S", ir.instructions[newPc])
                setCurrentType("S")
                break;
            case "B":
                console.log("B", ir.instructions[newPc])
                setCurrentType("B")
                break;
            case "J":
                console.log("J", ir.instructions[newPc])
                setCurrentType("J")
                break;
            case 'U': {
                console.log("U", ir.instructions[newPc])
                setCurrentType("U")
                break;
            }
        }
            
    }, [newPc, ir])
  return null
}

export default InstructionEffect