import { Search } from "lucide-react";
import Carouser from "./Carouser";
import Shortcouts from "./SettingsHelp/Shortcouts";

const data = [
  {
    icon: <Search  strokeWidth={1}  width={28} height={28}/>,
    content: "In the registers table you can search for names, values in base 2, 10, 16 (0X at the beginning) and ascii."
  },
  {
    icon: < Search  strokeWidth={1}  width={28} height={28}/>,
    content: "In the memory table you can search for any value in the table, such as an address or values."
  },
]

export function LastHelp() {

  return (
        <div className="flex flex-col gap-6">
            <Shortcouts />
            <div className="flex flex-col gap-2">
                <p className="font-semibold text-md">Search in tables</p>
                <Carouser data={data} />
            </div>
           
        </div>
  );
}

export default LastHelp;

