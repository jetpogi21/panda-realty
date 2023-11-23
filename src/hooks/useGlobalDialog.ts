import { create } from "zustand";

interface Dialog {
  message: React.ReactNode;
  setMessage: (message: React.ReactNode) => void;
  title: string;
  setTitle: (title: string) => void;
  open: boolean;
  openDialog: ({
    title,
    message,
    secondaryAction,
    isLoading,
    primaryAction,
    formMode,
  }: {
    title: string;
    message: React.ReactNode;
    secondaryAction?: () => void;
    isLoading?: boolean;
    primaryAction?: () => void;
    formMode?: boolean;
  }) => void;
  closeDialog: () => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  primaryAction?: () => void;
  setPrimaryAction: (primaryAction: () => void) => void;
  secondaryAction?: () => void;
  setSecondaryAction: (secondaryAction: () => void) => void;
  formMode: boolean;
}

const useGlobalDialog = create<Dialog>((set) => ({
  formMode: false,
  message: "",
  title: "",
  open: false,
  primaryAction: undefined,
  isLoading: false,
  secondaryAction: () => set({ open: false }),
  setIsLoading: (isLoading) => set({ isLoading }),
  closeDialog: () => set({ open: false }),
  setPrimaryAction: (primaryAction) => set({ primaryAction }),
  setSecondaryAction: (secondaryAction) => set({ secondaryAction }),
  setMessage: (message) => set({ message }),
  setTitle: (title) => set({ title }),
  openDialog({
    title,
    message,
    secondaryAction,
    isLoading,
    primaryAction,
    formMode,
  }) {
    return set({
      open: true,
      title,
      message,
      secondaryAction:
        (secondaryAction as () => void) || (() => set({ open: false })),
      primaryAction,
      isLoading: Boolean(isLoading),
      formMode: Boolean(formMode),
    });
  },
}));

export default useGlobalDialog;
