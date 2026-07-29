import { LucideIcon } from "lucide-react";

interface ToolbarToggleProps {
  active: boolean;
  title: string;
  onClick: () => void;
  icon: LucideIcon;
}

/**
 * A single icon toggle for a table's toolbar band: highlighted (accent) when
 * active, neutral when not. Shared by the program-memory follow-PC and
 * show-encoding toggles so their shell/sizing/active-state stay in one place.
 */
const ToolbarToggle = ({ active, title, onClick, icon: Icon }: ToolbarToggleProps) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`cursor-pointer transition-transform hover:scale-110 ${
      active ? "text-blue-600 dark:text-sky-400" : "text-black dark:text-white"
    }`}>
    <Icon strokeWidth={1.5} className="min-w-[1.3rem] min-h-[1.3rem] w-[1.3rem] h-[1.3rem]" />
  </button>
);

export default ToolbarToggle;
