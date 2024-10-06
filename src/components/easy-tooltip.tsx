import {
  TooltipContent,
  TooltipTrigger,
  Tooltip as TT,
} from "@/components/ui/tooltip";
import { TooltipContentProps } from "@radix-ui/react-tooltip";

export function EasyTooltip({
  children,
  tooltip,
  ...props
}: React.PropsWithChildren & { tooltip: string } & TooltipContentProps) {
  return (
    <TT>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent {...props}>{tooltip}</TooltipContent>
    </TT>
  );
}
