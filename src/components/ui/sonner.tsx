import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        style: {
          width: "320px",
          borderRadius: "12px",
          border: "0.5px solid var(--color-border)",
          padding: "12px 16px",
        },
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success:
            "!border-l-[3px] !border-l-[#1D9E75]",
          info:
            "!border-l-[3px] !border-l-[#EF9F27]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
