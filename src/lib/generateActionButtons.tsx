import { ModelRowActions } from "@/components/ModelRowActions";
import { Button } from "@/components/ui/Button";

export function generateActionButtons(
  rowActions: ModelRowActions | undefined,
  indexes: number[],
  openDialog: ({
    title,
    message,
    secondaryAction,
    isLoading,
    primaryAction,
  }: {
    title: string;
    message: string;
    secondaryAction?: (() => void) | undefined;
    isLoading?: boolean | undefined;
    primaryAction: () => void;
  }) => void,
  closeDialog: () => void,
  resetRowSelection: () => void
): React.ReactNode {
  return rowActions
    ? Object.keys(rowActions)
        .filter((actionKey) => {
          const action = rowActions?.[actionKey];
          const hasMultiSelectCondition = action?.multiSelectCondition;

          // If the action doesn't have a multiSelectCondition, include it
          // If it does, check the condition with the current indexes
          return (
            !hasMultiSelectCondition || action.multiSelectCondition?.(indexes)
          );
        })
        .map((key) => {
          const { actionFn, generateActionLabel, generateTexts, ButtonIcon } =
            rowActions[key];

          const { dialogTitle, dialogMessage, buttonText } =
            generateTexts(indexes);
          return (
            <Button
              key={key}
              type="button"
              size={"sm"}
              variant={"secondary"}
              onClick={() => {
                openDialog({
                  title: dialogTitle,
                  message: dialogMessage,
                  primaryAction: () => {
                    actionFn(indexes);
                    closeDialog();
                    resetRowSelection();
                  },
                });
              }}
              className="flex items-center justify-center gap-2"
            >
              {buttonText}
              {ButtonIcon && <ButtonIcon className="w-4 h-4 text-foreground" />}
            </Button>
          );
        })
    : null;
}
