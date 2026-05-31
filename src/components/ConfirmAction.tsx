import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

type ConfirmActionProps = {
  children: ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
};

export function ConfirmAction({
  children,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
}: ConfirmActionProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="max-w-md overflow-hidden rounded-2xl border-border p-0 shadow-2xl shadow-navy-deep/20">
        <div className="border-b border-border bg-secondary/50 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className={cn(
              "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
              destructive ? "bg-destructive/10 text-destructive" : "bg-gold/15 text-gold",
            )}>
              <AlertTriangle size={20} />
            </div>
            <AlertDialogHeader className="space-y-1 text-left">
              <AlertDialogTitle className="font-serif text-xl text-navy-deep">{title}</AlertDialogTitle>
              <AlertDialogDescription className="leading-relaxed">{description}</AlertDialogDescription>
            </AlertDialogHeader>
          </div>
        </div>
        <AlertDialogFooter className="gap-2 px-6 py-4 sm:space-x-0">
          <AlertDialogCancel asChild>
            <Button type="button" variant="outline">{cancelLabel}</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              type="button"
              onClick={onConfirm}
              className={cn(
                destructive
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : "bg-navy-deep text-cream hover:bg-navy",
              )}
            >
              {confirmLabel}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
