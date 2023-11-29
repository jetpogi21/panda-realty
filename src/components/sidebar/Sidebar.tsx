"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { AppConfig } from "@/lib/app-config";
import { getInitials } from "@/utils/utilities";
import { ModelConfig } from "@/interfaces/ModelConfig";
import { List, X } from "lucide-react";
import { LucideIcons } from "@/components/LucideIcons";
import Image from "next/image";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/Accordion";
import TooltipLink from "@/components/TooltipLink";
import useScreenSize from "@/hooks/useScreenSize";
import { useSidebar } from "@/lib/useSidebar";
import { Button } from "@/components/ui/Button";

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { appTitle } = AppConfig;
  const homeItem: Partial<ModelConfig> = {
    modelName: "dashboard",
    modelPath: "dashboard",
    navItemIcon: "BarChart2", // Assuming this is the type based on provided context
    navItemOrder: 1,
    pluralizedVerboseModelName: "Dashboard",
  };

  const AppConfigCopy = {
    ...AppConfig,
    models: [homeItem, ...AppConfig.models],
  };

  const mainMenuModels = AppConfigCopy.models
    .filter((model) => model.navItemOrder && !model.isMasterList)
    .sort(
      ({ navItemOrder: sortA }, { navItemOrder: sortB }) => sortA! - sortB!
    );

  const masterListModels = AppConfig.models
    .filter((model) => model.isMasterList)
    .sort(
      ({ navItemOrder: sortA }, { navItemOrder: sortB }) => sortA! - sortB!
    );

  const masterListPaths = masterListModels.map((model) => model.modelPath);
  let isCurrentPathAMasterListPath = false;
  for (let modelPath of masterListPaths) {
    if (pathname.includes(modelPath)) {
      isCurrentPathAMasterListPath = true;
      break;
    }
  }

  const [accordionValue, setAccordionValue] = useState(
    isCurrentPathAMasterListPath ? "item-1" : ""
  );

  const { isSidebarShown, toggleIsSidebarShown } = useSidebar((state) => ({
    isSidebarShown: state.isSidebarShown,
    setIsSidebarShown: state.setIsSidebarShown,
    toggleIsSidebarShown: state.toggleIsSidebarShown,
  }));

  const isScreenSizeBelowLarge = useScreenSize("lg");

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isSidebarShown && isScreenSizeBelowLarge) {
      document.body.style.overflowY = "hidden";
    } else {
      document.body.style.overflowY = "auto";
    }
  }, [isSidebarShown, isScreenSizeBelowLarge]);

  return (
    mounted && (
      <div
        className={cn(
          "lg:flex fixed lg:relative inset-y-0 inset-x-0 dark:bg-gray-900 z-10 lg:min-w-[250px] p-4 flex-col items-center  flex-grow-0 border-r border-border",
          !isSidebarShown && "hidden"
        )}
      >
        {isScreenSizeBelowLarge && (
          <Button
            variant={"ghost"}
            className="absolute p-2 rounded-full top-2 right-2"
            onClick={toggleIsSidebarShown}
          >
            <X className="w-4 h-4 " />
          </Button>
        )}

        <div
          className={cn("h-[120px] flex items-center justify-center w-full")}
        >
          <Link
            className="text-2xl font-bold leading-none"
            href="/"
          >
            {/* <span className="lg:hidden">{getInitials(appTitle)}</span> */}
            {/* <span className="hidden lg:block">{AppConfig.appTitle}</span> */}
            <div className="relative flex items-center justify-center">
              <Image
                src="/panda.png"
                height={70}
                width={120}
                alt="App Logo"
              />
            </div>
          </Link>
        </div>
        <div className="flex flex-col w-full text-sm">
          {mainMenuModels.map(
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
                <TooltipLink
                  key={modelName!}
                  modelName={modelName!}
                  modelPath={modelPath!}
                  pathname={pathname}
                  pluralizedVerboseModelName={pluralizedVerboseModelName!}
                  NavItemIcon={NavItemIcon}
                />
              );
            }
          )}
          {/*  The master list menu goes here  */}
          <Accordion
            type="single"
            value={accordionValue}
            collapsible
          >
            <AccordionItem
              value="item-1"
              className="border-0"
            >
              <AccordionTrigger
                className={cn(
                  "p-2 rounded-sm hover:bg-accent flex gap-4 items-center  lg:justify-between hover:no-underline",
                  {
                    "bg-accent": isCurrentPathAMasterListPath,
                  }
                )}
                onClick={(e) =>
                  setAccordionValue((prev) => (prev ? "" : "item-1"))
                }
              >
                <div className="flex gap-4">
                  <List className="w-4 h-4" />{" "}
                  <span className="lg:block">Master List</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="flex flex-col mt-2">
                {masterListModels.map(
                  ({ modelName, modelPath, pluralizedVerboseModelName }) => {
                    return (
                      <TooltipLink
                        key={modelName!}
                        modelName={modelName}
                        modelPath={modelPath}
                        pathname={pathname}
                        pluralizedVerboseModelName={pluralizedVerboseModelName}
                        NavItemIcon={null}
                      />
                    );
                  }
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    )
  );
};

export default Sidebar;
