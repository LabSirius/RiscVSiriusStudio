import { Label } from "@/components/ui/label"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { useCustomOptionSimulate } from "@/context/shared/CustomOptionSimulate"


export function SwitchSeeRegistersChanged() {

  const { checkFixedRegisters, setCheckFixedRegisters } = useCustomOptionSimulate()
  
    const handleCheckedChange = (value: boolean) => {
      setCheckFixedRegisters(value)  
    }
  
  return (
    <div className="flex items-center space-x-2" >
       <SwitchPrimitive.Root
            data-slot="switch"
            checked={checkFixedRegisters}
            onCheckedChange={handleCheckedChange}
            className="peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SwitchPrimitive.Thumb
              data-slot="switch-thumb"
              className="bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
            />
         </SwitchPrimitive.Root>
      <Label htmlFor="airplane-mode" className="text-md">Automatically add changing registers to the watch list.</Label>
    </div>
  )
}
export default SwitchSeeRegistersChanged


