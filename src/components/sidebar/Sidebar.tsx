"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import React from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { AppConfig } from "@/lib/app-config";
import { getInitials } from "@/utils/utilities";
import { ModelConfig } from "@/interfaces/ModelConfig";
import { Home, LayoutGrid } from "lucide-react";
import { LucideIcons } from "@/components/LucideIcons";

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { appTitle } = AppConfig;
  const homeItem: Partial<ModelConfig> = {
    modelName: "home",
    modelPath: "/",
    navItemIcon: "Home", // Assuming this is the type based on provided context
    navItemOrder: 1,
    pluralizedVerboseModelName: "Home",
  };

  const AppConfigCopy = {
    ...AppConfig,
    models: [homeItem, ...AppConfig.models],
  };

  return (
    <div
      className={cn(
        "lg:min-w-[250px] p-4 flex flex-col items-center flex-grow-0 border-r border-border"
      )}
    >
      <div className={cn("h-[100px] flex items-center")}>
        <Link
          className="text-2xl font-bold leading-none"
          href="/"
        >
          <span className="lg:hidden">{getInitials(appTitle)}</span>
          <span className="hidden lg:block">{AppConfig.appTitle}</span>
        </Link>
      </div>
      <div className="flex flex-col w-full text-sm">
        {AppConfigCopy.models
          .filter((model) => model.navItemOrder)
          .sort(
            ({ navItemOrder: sortA }, { navItemOrder: sortB }) =>
              sortA! - sortB!
          )
          .map(
            ({
              modelName,
              modelPath,
              navItemIcon,
              pluralizedVerboseModelName,
            }) => {
              const NavItemIcon = navItemIcon
                ? LucideIcons[navItemIcon as keyof typeof LucideIcons]
                : null;
              return (
                <Tooltip key={modelName}>
                  <TooltipTrigger>
                    <Link
                      href={"/" + modelPath!}
                      className={cn(
                        "p-2 rounded-sm hover:bg-accent flex gap-4 items-center justify-center lg:justify-start",
                        {
                          "bg-accent":
                            modelPath === "/"
                              ? pathname === modelPath
                              : pathname.includes(modelPath!),
                        }
                      )}
                    >
                      {NavItemIcon ? (
                        <NavItemIcon className="w-4 h-4" />
                      ) : (
                        <LayoutGrid className="w-4 h-4" />
                      )}
                      <span className="hidden lg:block">
                        {pluralizedVerboseModelName}
                      </span>
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
            }
          )}
      </div>
    </div>
  );
};

export default Sidebar;
