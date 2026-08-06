import * as React from "react";
import { cva } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// These are NOT the Radix primitives — they are plain elements with the shadcn names.
// That matters: nothing here comes with Radix's auto-dismiss timer or close wiring, so
// both have to be implemented, which is why "Regenerated successfully" used to sit on
// screen forever and the X did nothing.

// Lets ToastClose reach the toast it belongs to without threading props through Toaster.
const ToastDismissContext = React.createContext(null);

const ToastProvider = React.forwardRef(({ ...props }, ref) => (
  <div
    ref={ref}
    className="pointer-events-none fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]"
    {...props}
  />
));
ToastProvider.displayName = "ToastProvider";

// The provider above is already the container. This used to render a second, identical
// fixed overlay that sat empty on top of the toasts.
const ToastViewport = () => null;
ToastViewport.displayName = "ToastViewport";

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Toast = React.forwardRef(
  ({ className, variant, open = true, duration, onOpenChange, ...props }, ref) => {
    // Auto-dismiss. Without this nothing ever closed a toast on its own: `duration` was
    // being spread onto a <div> as an unknown attribute and simply ignored.
    React.useEffect(() => {
      if (!open || !duration) return undefined;
      const t = setTimeout(() => onOpenChange?.(false), duration);
      return () => clearTimeout(t);
    }, [open, duration, onOpenChange]);

    if (!open) return null;

    return (
      <ToastDismissContext.Provider value={onOpenChange}>
        <div
          ref={ref}
          className={cn(toastVariants({ variant }), className)}
          {...props}
        />
      </ToastDismissContext.Provider>
    );
  }
);
Toast.displayName = "Toast";

const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = "ToastAction";

const ToastClose = React.forwardRef(({ className, onClick, ...props }, ref) => {
  const dismiss = React.useContext(ToastDismissContext);
  return (
    <button
      ref={ref}
      type="button"
      aria-label="Close notification"
      // It had no handler at all, so clicking the X did nothing. It was also invisible
      // until hover, which made a stuck toast look like it had no close button.
      onClick={(e) => {
        onClick?.(e);
        dismiss?.(false);
      }}
      className={cn(
        "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-60 transition-opacity hover:text-foreground hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
        className
      )}
      toast-close=""
      {...props}
    >
      <X className="h-4 w-4" />
    </button>
  );
});
ToastClose.displayName = "ToastClose";

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
));
ToastTitle.displayName = "ToastTitle";

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
));
ToastDescription.displayName = "ToastDescription";

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}; 