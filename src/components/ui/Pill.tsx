import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface PillProps {
  caption: string | number;
  value: string | number;
  handleDelete?: () => void;
}

const Pill: React.FC<PillProps> = ({ caption, value, handleDelete }) => {
  return (
    <div
      className={cn(
        "flex items-center gap-1 px-2  text-xxs border rounded-full w-fit tracking-tighter bg-secondary"
      )}
    >
      {caption}
      <button
        className="p-1 rounded-full hover:bg-accent"
        onClick={() => handleDelete && handleDelete()}
      >
        <X className="w-[0.675rem] h-[0.675rem]" />
      </button>
    </div>
  );
};

export { Pill };
