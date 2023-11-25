import React from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/Tooltip";
import { LayoutGrid, LucideIcon } from "lucide-react";
import Link from "next/link";

interface TooltipLinkProps {
  modelName: string;
  modelPath: string;
  pathname: string;
  pluralizedVerboseModelName: string;
  NavItemIcon: LucideIcon | null;
}

const TooltipLink: React.FC<TooltipLinkProps> = ({
  modelName,
  modelPath,
  pathname,
  pluralizedVerboseModelName,
  NavItemIcon,
}) => {
  return (
    <Tooltip key={modelName}>
      <TooltipTrigger>
        <Link
          href={"/" + modelPath}
          className={cn(
            "p-2 rounded-sm hover:bg-accent flex gap-4 items-center justify-center lg:justify-start",
            {
              "bg-accent":
                modelPath === "/"
                  ? pathname === modelPath
                  : pathname.includes(modelPath),
            }
          )}
        >
          {NavItemIcon ? (
            <NavItemIcon className="w-4 h-4" />
          ) : (
            <LayoutGrid className="w-4 h-4" />
          )}

          <span className="hidden lg:block">{pluralizedVerboseModelName}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        className="lg:hidden"
      >
        {pluralizedVerboseModelName}
      </TooltipContent>
    </Tooltip>
  );
};

export default TooltipLink;
