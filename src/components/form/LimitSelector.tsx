import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import * as SelectPrimitive from "@radix-ui/react-select";
import {
  SelectGroup,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";
import React from "react";
import { ChevronDown } from "lucide-react";

interface LimitSelectorProps {
  handleLimitChange: (value: string) => void;
  value: string;
}
const LimitSelector: React.FC<LimitSelectorProps> = ({
  handleLimitChange,
  value,
}) => {
  return (
    <div className="self-end">
      <SelectGroup className="flex items-center gap-2">
        <Label htmlFor="limit">Limit</Label>
        <Select
          onValueChange={handleLimitChange}
          value={value}
          name="limit"
        >
          <SelectTrigger className="w-[80px]">
            <SelectValue placeholder="Record per page" />
            <SelectPrimitive.Icon asChild>
              <ChevronDown className="w-4 h-4 ml-6 opacity-50" />
            </SelectPrimitive.Icon>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="15">15</SelectItem>
            <SelectItem value="20">20</SelectItem>
          </SelectContent>
        </Select>
      </SelectGroup>
    </div>
  );
};

export default LimitSelector;
