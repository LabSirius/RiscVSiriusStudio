import { Button } from "@/components/ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

const ExampleImport =({ caseValue } : { caseValue: string }) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">@View example</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex flex-col gap-4 space-x-4">
          {caseValue === "register" ? (
            <>
            <p>32 lines of 32 bits</p>
            <div className="space-y-1 text-[.8rem]">
              <p className="font-mono">
                00000000000000000000000000000000 <br />
                00000000000000001000001000000001 <br />
                00000000000000000000000000111111 <br />
                .... <br />
                00000000000000000000010101010101
              </p>
            </div>
            </>
          ) : (
            <>
            <p>n lines, for the addresses we want to import</p>
            <div className="space-y-1 text-[.8rem]">
              <p className=" font-mono">
                24:00000000000000000000000000011000 <br />
                4C:00000000000000001000001000000001 <br />
                80:00000000000000000000000000111111 <br />
                8A:00000000000000000000000000111111 <br />
              </p>
            </div>
            </>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

export default ExampleImport
