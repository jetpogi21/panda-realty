import FilterControls, {
  FilterControlsProps,
} from "@/components/FilterControls";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/Dialog";
import { Separator } from "@/components/ui/Separator";
import { ListFilter, X } from "lucide-react";
import React, { FC } from "react";

interface FilterDialogProps extends FilterControlsProps {
  onClearClick: React.MouseEventHandler;
  onSubmitClick: React.MouseEventHandler;
}

const FilterDialog: FC<FilterDialogProps> = ({
  onClearClick,
  onSubmitClick,
  config,
  requiredList,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Dialog open={isOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          onClick={() => setIsOpen(true)}
        >
          <ListFilter className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="w-[90%]"
        onPointerDownOutside={() => setIsOpen(false)}
      >
        <div className="flex items-center">
          <div className="font-bold">
            Filter {config.pluralizedVerboseModelName}
          </div>
          <Button
            type="button"
            variant={"ghost"}
            size="sm"
            className="ml-auto"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-4 h-4 " />
          </Button>
        </div>
        <div className="flex flex-col gap-4">
          <FilterControls
            config={config}
            requiredList={requiredList}
          />
        </div>
        <Separator />
        <div className="flex justify-between gap-2">
          <Button
            type="button"
            variant={"ghost"}
            size="sm"
            onClick={(e) => {
              onClearClick(e);
              setIsOpen(false);
            }}
          >
            Clear all
          </Button>
          <Button
            type="button"
            className="bg-primary"
            size="sm"
            onClick={(e) => {
              onSubmitClick(e);
              setIsOpen(false);
            }}
          >
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilterDialog;
