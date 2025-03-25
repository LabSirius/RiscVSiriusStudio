import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export function SwitchSeeRegistersChanged() {
  return (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode" className="text-md">Fix registers that change.</Label>
    </div>
  )
}
export default SwitchSeeRegistersChanged
