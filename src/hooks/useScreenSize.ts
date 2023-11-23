import { useState, useEffect } from "react";

type Size = "sm" | "md" | "lg" | "xl" | "2xl";

function useScreenSize(inputSize: Size): boolean {
  const [size, setSize] = useState<Size>(getSize);
  const [mounted, setMounted] = useState(false);

  function getSize(): Size {
    if (typeof window !== "undefined") {
      const width = window.innerWidth;
      if (width < 640) return "sm";
      if (width < 768) return "md";
      if (width < 1024) return "lg";
      if (width < 1280) return "xl";
      return "2xl";
    }
    return "sm"; // or return a default size
  }

  const throttle = (func: () => void, limit: number) => {
    let inThrottle: NodeJS.Timeout | undefined;
    return function () {
      if (!inThrottle) {
        func();
        inThrottle = setTimeout(() => (inThrottle = undefined), limit);
      }
    };
  };

  useEffect(() => {
    const handleWindowResize = throttle(() => setSize(getSize()), 0);
    if (mounted) {
      window.addEventListener("resize", handleWindowResize);
    } else {
      setMounted(true);
    }
    // Return a function from the effect that removes the event listener
    return () =>
      window && window.removeEventListener("resize", handleWindowResize);
  }, [mounted]);

  const sizeOrder: Size[] = ["sm", "md", "lg", "xl", "2xl"];
  return sizeOrder.indexOf(size) <= sizeOrder.indexOf(inputSize);
}

export default useScreenSize;
