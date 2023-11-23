"use client";
import { useListURLStore } from "@/hooks/useURL";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const PageSession = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const url = `${pathname}?${searchParams}`;

  const { setListURL } = useListURLStore((state) => ({
    setListURL: state.setListURL,
  }));

  useEffect(() => {
    setListURL(url);
  }, [url]);

  return null;
};

export default PageSession;
