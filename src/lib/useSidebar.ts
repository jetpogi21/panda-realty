import { create } from "zustand";

// Define a state
type State = {
  isSidebarShown: boolean;
  setIsSidebarShown: (isSidebarShown: State["isSidebarShown"]) => void;
  toggleIsSidebarShown: () => void;
};

// Create a store
export const useSidebar = create<State>((set) => ({
  isSidebarShown: false,
  setIsSidebarShown: (isSidebarShown) => set({ isSidebarShown }),
  toggleIsSidebarShown: () =>
    set((state) => ({ isSidebarShown: !state.isSidebarShown })),
}));
