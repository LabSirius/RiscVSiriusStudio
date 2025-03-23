import { File, Play, Cpu } from "lucide-react";
import Carouser from "./Carouser";

const data = [
  {
    icon: <File  strokeWidth={1}  width={28} height={28}/>,
    content: "Use a file with the .asm extension and place your instructions there."
  },
  {
    icon: < Play  strokeWidth={1}  width={28} height={28}/>,
    content: "Press the play button to start the conversion process."
  },
  {
    icon: <Cpu strokeWidth={1}  width={28} height={28}/>,
    content: "If you want to see the simulation press the CPU icon."
  }
]

export function FirstHelp() {

  return (
      <Carouser data={data} />
  );
}

export default FirstHelp;



