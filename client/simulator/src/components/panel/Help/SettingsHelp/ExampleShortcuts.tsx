import { Button } from "@/components/panel/ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/panel/ui/hover-card"

import { Layers2 } from "lucide-react"

const ExampleShortcuts =({ caseValue } : { caseValue: string }) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild >
        <div className="flex gap-1 items-center justify-center">
        <Layers2 width={24} height={24} strokeWidth={1} />
        <Button variant="link">@View example</Button>
        </div>
     
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex flex-col gap-4 space-x-4">
          {caseValue === "register" ? (
            <>

            <div className="flex flex-col gap-3 ">
            <p className="text-gray-400 text-[.8rem]">By standing on a cell containing a number and pressing one of the following keys you momentarily convert the number.</p>
            <div className="space-y-1 text-[.7rem]">
              <p className="font-mono">
                d: For a decimal  <br />
                h: For a hexadecimal  <br />
                b: For a binary  <br />
              </p>
            </div>
            </div>

            <div className="flex flex-col gap-3 ">
            <p className="mt-2 text-gray-400 text-[.8rem]">By standing over a value type cell and pressing the following keys you will change it (Not momentary).</p>
            <div className="space-y-1 text-[.7rem]">
              <p className="font-mono">
                b: For a decimal binary <br />
                h: For a hexadecimal  <br />
                s: For a signed  <br />
                u: For a unsigned  <br />
                a: For a ascci  <br />
              </p>
            </div>
            </div>
            
            </>
          ) : (
            <>
            <p className="mt-2 text-gray-400 text-[.8rem]">By standing on a cell and pressing the following letters you will momentarily convert its numerical value</p>
            <div className="space-y-1 text-[.7rem]">
              <p className="font-mono">
              d: For a decimal  <br />
                h: For a hexadecimal  <br />
                b: For a binary  <br />
              </p>
            </div>
            </>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

export default ExampleShortcuts
