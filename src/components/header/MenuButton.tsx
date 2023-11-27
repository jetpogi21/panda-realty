"use client";

import { Button } from "@/components/ui/Button";
import useScreenSize from "@/hooks/useScreenSize";
import { useSidebar } from "@/lib/useSidebar";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";

const MenuButton: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const isScreenSizeBelowLarge = useScreenSize("lg");

  const { toggleIsSidebarShown } = useSidebar((state) => ({
    isSidebarShown: state.isSidebarShown,
    setIsSidebarShown: state.setIsSidebarShown,
    toggleIsSidebarShown: state.toggleIsSidebarShown,
  }));

  const shouldRender = mounted && isScreenSizeBelowLarge;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    shouldRender && (
      <Button
        variant={"ghost"}
        className="p-2"
        onClick={toggleIsSidebarShown}
      >
        <Menu className="w-5 h-5" />
      </Button>
    )
  );
};

export default MenuButton;
