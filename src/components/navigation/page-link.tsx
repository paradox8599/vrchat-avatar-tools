"use client";
import React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { EasyTooltip } from "@/components/easy-tooltip";
import { usePathname } from "next/navigation";

export default function PageLink({
  tooltip,
  href,
  children,
}: {
  href: string;
  tooltip?: string;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const isActive = path === href;

  const button = (
    <Button
      asChild
      size="icon"
      variant={isActive ? "default" : "ghost"}
      aria-label={tooltip}
    >
      <Link href={href}>{children}</Link>
    </Button>
  );

  if (tooltip)
    return (
      <EasyTooltip tooltip={tooltip} side="right" align="center">
        {button}
      </EasyTooltip>
    );

  return button;
}
