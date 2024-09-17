import {
  TooltipContent,
  TooltipTrigger,
  Tooltip as TT,
} from "@/components/ui/tooltip";
import { TooltipContentProps } from "@radix-ui/react-tooltip";

export function Tooltip({
  children,
  tooltip,
  ...props
}: React.PropsWithChildren & { tooltip: string } & TooltipContentProps) {
  return (
    <TT>
      <TooltipTrigger>{children}</TooltipTrigger>
      <TooltipContent {...props}>{tooltip}</TooltipContent>
    </TT>
  );
}
