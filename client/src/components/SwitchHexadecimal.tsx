import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export function SwitchHexadecimal() {
  return (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode" className="text-md">Show hexadecimal in memory table</Label>
    </div>
  )
}
export default SwitchHexadecimal
