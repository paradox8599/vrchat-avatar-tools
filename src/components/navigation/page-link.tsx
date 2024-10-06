"use client";
import React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { EasyTooltip } from "@/components/easy-tooltip";
import { ROUTES } from "@/routes";

export default function PageLink({
  tooltip,
  href,
  children,
  size = "icon",
  variant = "ghost",
  side = "right",
  align = "center",
}: {
  href: ROUTES;
  tooltip?: string;
  children: React.ReactNode;
  size?: "sm" | "lg" | "icon" | "default";
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | null
    | undefined;
  side?: "top" | "right" | "bottom" | "left" | undefined;
  align?: "center" | "start" | "end" | undefined;
}) {
  const button = (
    <Button asChild size={size} variant={variant} aria-label={tooltip}>
      <Link href={href}>{children}</Link>
    </Button>
  );

  if (tooltip)
    return (
      <EasyTooltip tooltip={tooltip} side={side} align={align}>
        {button}
      </EasyTooltip>
    );
  else return button;
}
