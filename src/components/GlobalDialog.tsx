"use client";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import useGlobalDialog from "@/hooks/useGlobalDialog";

export function GlobalDialog() {
  const {
    open,
    message,
    title,
    closeDialog,
    primaryAction,
    secondaryAction,
    isLoading,
    formMode,
  } = useGlobalDialog((state) => ({
    open: state.open,
    message: state.message,
    title: state.title,
    closeDialog: state.closeDialog,
    primaryAction: state.primaryAction,
    secondaryAction: state.secondaryAction,
    isLoading: state.isLoading,
    formMode: state.formMode,
  }));

  return (
    <Dialog open={open}>
      <DialogContent className="w-full max-w-[80%] lg:max-w-md">
        <DialogPrimitive.Close
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          onClick={closeDialog}
        >
          <X className="w-4 h-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {message}
        </DialogHeader>
        {formMode ? null : (
          <DialogFooter>
            <Button
              type="button"
              size="sm"
              variant={"destructive"}
              isLoading={isLoading}
              onClick={primaryAction}
            >
              Proceed
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={secondaryAction}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
