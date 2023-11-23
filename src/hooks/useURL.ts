import { parseParams } from "@/utils/utils";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { URLSearchParams } from "url";
import { create } from "zustand";

type State = {
  listURL: string;
  setListURL: (listURL: string) => void;
};

const useURL = <T>() => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams() as unknown as URLSearchParams;
  const query = parseParams(searchParams) as Partial<T>;

  return { router, pathname, query };
};

const useListURLStore = create<State>((set) => ({
  listURL: "",
  setListURL: (listURL) => set({ listURL }),
}));

export { useURL, useListURLStore };
